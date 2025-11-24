import { useState, useMemo } from 'react'
import ReactDiffViewer from 'react-diff-viewer'
import { Tooltip } from 'react-tooltip'
import levenshtein from 'fast-levenshtein'
import DOMPurify from 'dompurify'

const specialChars = {
  '\t': { desc: 'Tab', code: 'U+0009', display: '→', fullText: 'Tab', example: 'Product Name\tPrice\tQuantity\nLaptop Computer\t$899.99\t5\nWireless Mouse\t$24.99\t50', usage: 'Creates horizontal spacing, typically 4-8 spaces wide. Common in TSV files and code indentation.' },
  '\n': { desc: 'Line Feed', code: 'U+000A', display: '↵', fullText: 'Line Feed (new line)', example: '123 Main Street\nApartment 4B\nSpringfield, IL 62701\nUnited States of America', usage: 'Standard line break on Unix/Linux/Mac systems. In localization, watch for platform-specific line endings.' },
  '\r': { desc: 'Carriage Return', code: 'U+000D', display: '⏎', fullText: 'Carriage Return', example: 'Windows line ending example:\r\nFirst line of text\r\nSecond line of text\r\nThird line of text', usage: 'Part of Windows line ending (\\r\\n). Rarely used alone in modern text. May cause issues in cross-platform files.' },
  '\u00A0': { desc: 'Non-breaking Space', code: 'U+00A0', display: 'NBSP', fullText: 'Non-breaking Space', example: 'Speed: 100\u00A0km/h\nPrice: $\u00A01,299.99\nMr.\u00A0John\u00A0Smith\nMarch\u00A025,\u00A02024', usage: 'Prevents line breaks between words/numbers. Critical for: units (100 km/h), currency ($ 1,299.99), titles (Mr. Smith), dates (March 25, 2024).' },
  '\u200B': { desc: 'Zero-width Space', code: 'U+200B', display: 'ZWSP', fullText: 'Zero-width Space', example: 'https://www.\u200Bvery\u200Blong\u200Bexample\u200Bwebsite\u200Burl\u200Baddress.\u200Bcom/path/to/resource\nsuper\u200Bcali\u200Bfragil\u200Bistic\u200Bexpi\u200Bali\u200Bdocious', usage: 'Allows line breaking in long URLs, compound words, or CJK text without visible space. Invisible but affects layout.' },
  '\u00AD': { desc: 'Soft Hyphen', code: 'U+00AD', display: 'SHY', fullText: 'Soft Hyphen', example: 'This is a very long German word: Donau\u00ADdampf\u00ADschiff\u00ADfahrts\u00ADgesell\u00ADschafts\u00ADkapitän\nAnd another: Rechts\u00ADschutz\u00ADversiche\u00ADrungs\u00ADgesell\u00ADschaften', usage: 'Shows hyphen only when word breaks across lines. Essential for long words in German, Dutch, Finnish localization.' },
  '\u2028': { desc: 'Line Separator', code: 'U+2028', display: 'LS', fullText: 'Line Separator', example: 'This is the first semantic line of a paragraph that continues.\u2028This is the second semantic line within the same paragraph.\u2028And here is a third semantic line.', usage: 'Unicode-specific line break within paragraphs. May appear in JSON strings or international text processing.' },
  '\u2029': { desc: 'Paragraph Separator', code: 'U+2029', display: 'PS', fullText: 'Paragraph Separator', example: 'This is the complete first paragraph with several words to make it substantial.\u2029This is the second paragraph that follows after the Unicode paragraph separator.\u2029And here begins the third distinct paragraph.', usage: 'Unicode paragraph boundary marker. Semantic separator for structured text, distinct from simple line breaks.' },
  '\u200C': { desc: 'Zero-width Non-joiner', code: 'U+200C', display: 'ZWNJ', fullText: 'Zero-width Non-joiner', example: 'Persian example: من می\u200Cخواهم (I want) vs میخواهم (wrong)\nHindi example: क्\u200Cय vs क्य (ligature difference)\nFarsi word: نمی\u200Cدانم (I don\'t know)', usage: 'Critical for Persian, Arabic, Devanagari scripts. Prevents unwanted letter joining while maintaining proper spacing.' },
  '\u200D': { desc: 'Zero-width Joiner', code: 'U+200D', display: 'ZWJ', fullText: 'Zero-width Joiner', example: 'Family emoji: 👨\u200D👩\u200D👧\u200D👦 (man+woman+girl+boy)\nProfession: 👨\u200D⚕️ (doctor) vs 👨 ⚕️ (separate)\nArabic: ل\u200Dا creates ligature', usage: 'Forms complex emoji sequences and ligatures. Essential for emoji families, skin tones, and connecting Arabic characters.' },
  '\u200E': { desc: 'Left-to-right Mark', code: 'U+200E', display: 'LRM', fullText: 'Left-to-right Mark', example: 'Arabic with number: مرحبا\u200E 123 (correct) vs مرحبا 123 (may reverse)\nEmail in RTL: البريد: user@\u200Eexample.com\nMixed: שלום\u200E, how are you?', usage: 'Forces LTR direction for numbers, emails, URLs in RTL text (Arabic, Hebrew). Prevents display corruption.' },
  '\u200F': { desc: 'Right-to-left Mark', code: 'U+200F', display: 'RLM', fullText: 'Right-to-left Mark', example: 'Price in Hebrew: המחיר:\u200F $99.99 (keeps $ on right)\nEnglish with RTL punctuation: Hello\u200F, שלום\nDate: התאריך:\u200F 23/11/2024', usage: 'Forces RTL direction for punctuation and numbers in bidirectional text. Critical for Hebrew/Arabic localization.' },
  '\u202A': { desc: 'Left-to-right Embedding', code: 'U+202A', display: 'LRE', fullText: 'Left-to-right Embedding', example: 'Arabic text with URL: زيارة \u202Ahttps://example.com/page\u202C للمزيد\nRTL with LTR: العنوان \u202A123 Main Street\u202C في المدينة', usage: 'Embeds LTR text section within RTL content. Must be closed with PDF (U+202C). Use for URLs in Arabic text.' },
  '\u202B': { desc: 'Right-to-left Embedding', code: 'U+202B', display: 'RLE', fullText: 'Right-to-left Embedding', example: 'English with Hebrew quote: He said \u202Bשלום עולם\u202C which means "hello world"\nLTR with RTL: The word is \u202Bمرحبا\u202C in Arabic', usage: 'Embeds RTL text section within LTR content. Requires PDF (U+202C) to close. Use for Hebrew/Arabic quotes.' },
  '\u202C': { desc: 'Pop Directional Formatting', code: 'U+202C', display: 'PDF', fullText: 'Pop Directional Formatting', example: 'Normal text \u202AMixed direction content here\u202C back to normal\nNested: Start \u202BLTR \u202ARTL inside\u202C end LTR\u202C back to start', usage: 'Closes LRE, RLE, LRO, or RLO. Essential pair with bidirectional formatting. Missing PDF causes layout issues.' },
  '\u202D': { desc: 'Left-to-right Override', code: 'U+202D', display: 'LRO', fullText: 'Left-to-right Override', example: 'Force Hebrew LTR: \u202D!שלום עולם\u202C shows as !םלוע םולש (reversed)\nOverride Arabic: \u202Dمرحبا 123\u202C all displays left-to-right', usage: 'Forces all text LTR regardless of character properties. Stronger than LRM. Use with caution, always close with PDF.' },
  '\u202E': { desc: 'Right-to-left Override', code: 'U+202E', display: 'RLO', fullText: 'Right-to-left Override', example: 'Reverse English: \u202EHello World!\u202C displays as !dlroW olleH\nReverse URL: \u202Eexample.com\u202C shows as moc.elpmaxe (security risk!)', usage: 'Forces all text RTL regardless of properties. Can reverse entire strings. Security risk if misused (spoofing).' },
  '\uFEFF': { desc: 'Zero-width No-break Space', code: 'U+FEFF', display: 'BOM', fullText: 'Zero-width No-break Space (BOM)', example: '\uFEFF<?xml version="1.0" encoding="UTF-8"?>\n\uFEFF{"name": "config", "type": "UTF-8"}\nFile starts with BOM: \uFEFFThis is the first line', usage: 'Byte Order Mark at file start signals UTF encoding. Also prevents word breaks. May cause parsing errors if unexpected.' },
  '\u2060': { desc: 'Word Joiner', code: 'U+2060', display: 'WJ', fullText: 'Word Joiner', example: 'Keep\u2060together without visible space\nVersion\u20601.0.2\nISBN\u2060978-3-16-148410-0', usage: 'Zero-width non-breaking character. Prevents line breaks without adding visible space. Useful in technical docs and version numbers.' },
  '\u2007': { desc: 'Figure Space', code: 'U+2007', display: 'FIGSP', fullText: 'Figure Space', example: 'Align numbers:\n\u2007\u2007123.45\n\u20071,234.56\n123,456.78', usage: 'Same width as digits (0-9). Used to align numbers in tables and financial data. Essential for tabular localization.' },
  '\u2009': { desc: 'Thin Space', code: 'U+2009', display: 'THNSP', fullText: 'Thin Space', example: 'French punctuation\u2009: «\u2009Bonjour\u2009»\nQuestion\u2009?\nExclamation\u2009!', usage: 'Narrower than normal space. Standard in French typography before punctuation (? ! ; :) and inside guillemets.' },
  '\u202F': { desc: 'Narrow No-break Space', code: 'U+202F', display: 'NNBSP', fullText: 'Narrow No-break Space', example: 'French: 123\u202F456\u202F789\nPercentage: 99\u202F%\nTime: 14\u202Fh\u202F30\nPrice: 1\u202F234,56\u202F€', usage: 'Required in French localization for: thousand separators (123 456), percentages (99 %), units (14 h), currency.' },
  '\u180E': { desc: 'Mongolian Vowel Separator', code: 'U+180E', display: 'MVS', fullText: 'Mongolian Vowel Separator', example: 'Mongolian text with vowel separator\u180E(invisible formatting)', usage: 'Mongolian script-specific character. Indicates vowel separation. Rarely needed but critical for Mongolian localization.' },
  '\u2002': { desc: 'En Space', code: 'U+2002', display: 'ENSP', fullText: 'En Space', example: 'Typography:\u2002En-width spacing\nDates:\u2002Jan\u20021–15,\u20022024', usage: 'Width of lowercase "n". Used in professional typography and publishing. Common in date ranges and lists.' },
  '\u2003': { desc: 'Em Space', code: 'U+2003', display: 'EMSP', fullText: 'Em Space', example: 'Typography:\u2003Em-width spacing (wider)\nParagraph:\u2003Indented first line', usage: 'Width of uppercase "M". Widest standard space. Used for paragraph indentation and professional typesetting.' },
  '\u2004': { desc: 'Three-Per-Em Space', code: 'U+2004', display: '3/M', fullText: 'Three-Per-Em Space', example: 'Fine\u2004spacing\u2004control\nList:\u2004Item\u20041,\u2004Item\u20042', usage: 'One-third of an em width. Precise spacing control in professional typography and desktop publishing.' },
  '\u2005': { desc: 'Four-Per-Em Space', code: 'U+2005', display: '4/M', fullText: 'Four-Per-Em Space', example: 'Tighter\u2005spacing\u2005control\nNumbers:\u20051,234\u2005567', usage: 'One-quarter of an em width. Fine-grained spacing for professional layouts and justified text.' },
  '\u2006': { desc: 'Six-Per-Em Space', code: 'U+2006', display: '6/M', fullText: 'Six-Per-Em Space', example: 'Very\u2006fine\u2006spacing\nAbbrev.:\u2006Dr.\u2006Smith', usage: 'One-sixth of an em width. Finest spacing control in professional typography. Used in abbreviations and initials.' },
  '\u2066': { desc: 'Left-to-right Isolate', code: 'U+2066', display: 'LRI', fullText: 'Left-to-right Isolate', example: 'Modern RTL: Arabic text \u2066LTR content here\u2069 continues\nURL in RTL: Visit \u2066example.com\u2069 now', usage: 'Modern replacement for LRE (U+202A). Better isolation of LTR text in RTL context. Requires PDI (U+2069) to close.' },
  '\u2067': { desc: 'Right-to-left Isolate', code: 'U+2067', display: 'RLI', fullText: 'Right-to-left Isolate', example: 'Modern LTR: English text \u2067مرحبا بك\u2069 continues\nQuote: He said \u2067שלום\u2069 to everyone', usage: 'Modern replacement for RLE (U+202B). Better isolation of RTL text in LTR context. Requires PDI (U+2069) to close.' },
  '\u2068': { desc: 'First Strong Isolate', code: 'U+2068', display: 'FSI', fullText: 'First Strong Isolate', example: 'Auto-detect: \u2068Could be LTR or RTL\u2069 text\nSmart: \u2068مرحبا\u2069 or \u2068Hello\u2069', usage: 'Automatically detects text direction from first strong directional character. Most flexible modern bidirectional control.' },
  '\u2069': { desc: 'Pop Directional Isolate', code: 'U+2069', display: 'PDI', fullText: 'Pop Directional Isolate', example: 'Close isolate: \u2066LTR text\u2069 back to normal\nNested: \u2067RTL \u2066inner LTR\u2069 back to RTL\u2069 normal', usage: 'Closes LRI, RLI, or FSI. Modern replacement for PDF (U+202C). Essential pair with Unicode 6.3+ isolate characters.' },
}

function TextDiff() {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [selectedChar, setSelectedChar] = useState(null)

  const processedText1 = useMemo(() => {
    // Replace newlines with a placeholder to preserve them in diff
    return text1.replace(/\n/g, '␊\n').replace(/\r/g, '␍')
  }, [text1])

  const processedText2 = useMemo(() => {
    // Replace newlines with a placeholder to preserve them in diff
    return text2.replace(/\n/g, '␊\n').replace(/\r/g, '␍')
  }, [text2])

  const similarity = useMemo(() => {
    if (!text1 && !text2) return 100
    const distance = levenshtein.get(text1, text2)
    const maxLen = Math.max(text1.length, text2.length)
    return maxLen === 0 ? 100 : ((maxLen - distance) / maxLen * 100).toFixed(2)
  }, [text1, text2])

  const handleMarkerClick = (char) => {
    setSelectedChar(char)
    setShowInfoModal(true)
  }

  return (
    <>
      <main className="page">
        <header className="page-header">
          <h1>Text Comparison</h1>
          <div className="page-header-stats">
            <span className="stat-badge">Similarity: {similarity}%</span>
          </div>
        </header>

        <section className="editor-row">
          <article className="editor-panel">
            <header className="editor-header">
              <span className="editor-title">Text 1 (Original)</span>
            </header>
            <textarea
              className="editor-textarea"
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              placeholder="Enter or paste the first text for comparison..."
              aria-label="Original text for comparison"
            />
          </article>

          <article className="editor-panel">
            <header className="editor-header">
              <span className="editor-title">Text 2 (Comparison)</span>
            </header>
            <textarea
              className="editor-textarea"
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              placeholder="Enter or paste the second text for comparison..."
              aria-label="Comparison text"
            />
          </article>
        </section>

        <section className="extras">
          <div className="special-chars-section" role="region" aria-label="Visual diff viewer">
            <div className="section-header">
              <h3>Visual Differences</h3>
            </div>
            <ReactDiffViewer
              oldValue={processedText1}
              newValue={processedText2}
              splitView={true}
              compareMethod="diffWords"
              showDiffOnly={false}
              useDarkTheme={false}
              renderContent={(content) => {
                // Post-process the content to add markers for special chars
                if (content) {
                  let processedContent = content
                  
                  // First, escape HTML entities
                  processedContent = processedContent
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;')
                  
                  // Replace newline placeholders with markers
                  processedContent = processedContent
                    .replace(/␊/g, `<span class="special-char-marker" data-char-key="a" data-tooltip-id="diff-special-tooltip" data-tooltip-content="Line Feed (U+000A)" title="Line Feed">↵</span>`)
                    .replace(/␍/g, `<span class="special-char-marker" data-char-key="d" data-tooltip-id="diff-special-tooltip" data-tooltip-content="Carriage Return (U+000D)" title="Carriage Return">⏎</span>`)
                  
                  // Then add special character markers for other special chars
                  Object.entries(specialChars).forEach(([char, info]) => {
                    // Skip line breaks - we handled them above
                    if (char === '\n' || char === '\r' || char === '\t') return
                    
                    const escapedChar = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                    const charKey = char.charCodeAt(0).toString(16)
                    processedContent = processedContent.replace(
                      new RegExp(escapedChar, 'g'),
                      `<span class="special-char-marker" data-char-key="${charKey}" data-tooltip-id="diff-special-tooltip" data-tooltip-content="${info.desc} (${info.code})" title="${info.desc}">${info.display}</span>`
                    )
                  })
                  
                  // Sanitize the HTML with DOMPurify before rendering
                  const sanitizedContent = DOMPurify.sanitize(processedContent, {
                    ALLOWED_TAGS: ['span'],
                    ALLOWED_ATTR: ['class', 'data-char-key', 'data-tooltip-id', 'data-tooltip-content', 'title']
                  })
                  
                  return (
                    <span 
                      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                      onClick={(e) => {
                        if (e.target.classList.contains('special-char-marker')) {
                          const charKey = e.target.getAttribute('data-char-key')
                          const char = String.fromCharCode(parseInt(charKey, 16))
                          handleMarkerClick(char)
                        }
                      }}
                    />
                  )
                }
                return content
              }}
              styles={{
                wordDiff: {
                  display: 'inline',
                  whiteSpace: 'pre-wrap'
                }
              }}
            />
          </div>
        </section>
      </main>
      <Tooltip id="diff-special-tooltip" />

      {showInfoModal && selectedChar && specialChars[selectedChar] && (
        <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{specialChars[selectedChar].fullText}</h2>
              <button className="modal-close" onClick={() => setShowInfoModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-section">
                <h3>Unicode</h3>
                <p>{specialChars[selectedChar].code}</p>
              </div>
              <div className="modal-section">
                <h3>Description</h3>
                <p>{specialChars[selectedChar].desc}</p>
              </div>
              <div className="modal-section">
                <h3>Usage</h3>
                <p>{specialChars[selectedChar].usage}</p>
              </div>
              <div className="modal-section">
                <h3>Example</h3>
                <pre>{specialChars[selectedChar].example}</pre>
              </div>
              <div className="modal-section">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedChar)
                    alert('Character copied to clipboard!')
                  }}
                >
                  Copy Character
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TextDiff