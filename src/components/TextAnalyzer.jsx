import { useState, useMemo } from 'react'
import { Tooltip } from 'react-tooltip'

const specialChars = {
  '\t': { 
    desc: 'Tab', 
    code: 'U+0009', 
    display: '→', 
    fullText: 'Tab', 
    example: 'Product Name\tPrice\tQuantity\nLaptop Computer\t$899.99\t5\nWireless Mouse\t$24.99\t50', 
    usage: 'Creates horizontal spacing, typically 4-8 spaces wide. Common in TSV files and code indentation.' 
  },
  '\n': { 
    desc: 'Line Feed', 
    code: 'U+000A', 
    display: '↵', 
    fullText: 'Line Feed (new line)', 
    example: '123 Main Street\nApartment 4B\nSpringfield, IL 62701\nUnited States of America', 
    usage: 'Standard line break on Unix/Linux/Mac systems. In localization, watch for platform-specific line endings.' 
  },
  '\r': { 
    desc: 'Carriage Return', 
    code: 'U+000D', 
    display: '⏎', 
    fullText: 'Carriage Return', 
    example: 'Windows line ending example:\r\nFirst line of text\r\nSecond line of text\r\nThird line of text', 
    usage: 'Part of Windows line ending (\\r\\n). Rarely used alone in modern text. May cause issues in cross-platform files.' 
  },
  '\u00A0': { 
    desc: 'Non-breaking Space', 
    code: 'U+00A0', 
    display: 'NBSP', 
    fullText: 'Non-breaking Space', 
    example: 'Speed: 100\u00A0km/h\nPrice: $\u00A01,299.99\nMr.\u00A0John\u00A0Smith\nMarch\u00A025,\u00A02024', 
    usage: 'Prevents line breaks between words/numbers. Critical for: units (100 km/h), currency ($ 1,299.99), titles (Mr. Smith), dates (March 25, 2024).' 
  },
  '\u200B': { 
    desc: 'Zero-width Space', 
    code: 'U+200B', display: 'ZWSP', 
    fullText: 'Zero-width Space', 
    example: 'https://www.\u200Bvery\u200Blong\u200Bexample\u200Bwebsite\u200Burl\u200Baddress.\u200Bcom/path/to/resource\nsuper\u200Bcali\u200Bfragil\u200Bistic\u200Bexpi\u200Bali\u200Bdocious', 
    usage: 'Allows line breaking in long URLs, compound words, or CJK text without visible space. Invisible but affects layout.' 
  },
  '\u00AD': { 
    desc: 'Soft Hyphen', 
    code: 'U+00AD', 
    display: 'SHY', 
    fullText: 'Soft Hyphen', 
    example: 'This is a very long German word: Donau\u00ADdampf\u00ADschiff\u00ADfahrts\u00ADgesell\u00ADschafts\u00ADkapitän\nAnd another: Rechts\u00ADschutz\u00ADversiche\u00ADrungs\u00ADgesell\u00ADschaften', 
    usage: 'Shows hyphen only when word breaks across lines. Essential for long words in German, Dutch, Finnish localization.' 
  },
  '\u2028': { 
    desc: 'Line Separator', 
    code: 'U+2028', 
    display: 'LS', 
    fullText: 'Line Separator', 
    example: 'This is the first semantic line of a paragraph that continues.\u2028This is the second semantic line within the same paragraph.\u2028And here is a third semantic line.', 
    usage: 'Unicode-specific line break within paragraphs. May appear in JSON strings or international text processing.' 
  },
  '\u2029': { 
    desc: 'Paragraph Separator', 
    code: 'U+2029', 
    display: 'PS', 
    fullText: 'Paragraph Separator', 
    example: 'This is the complete first paragraph with several words to make it substantial.\u2029This is the second paragraph that follows after the Unicode paragraph separator.\u2029And here begins the third distinct paragraph.', 
    usage: 'Unicode paragraph boundary marker. Semantic separator for structured text, distinct from simple line breaks.' 
  },
  '\u200C': { 
    desc: 'Zero-width Non-joiner', 
    code: 'U+200C', 
    display: 'ZWNJ', 
    fullText: 'Zero-width Non-joiner', 
    example: 'Persian example: من می\u200Cخواهم (I want) vs میخواهم (wrong)\nHindi example: क्\u200Cय vs क्य (ligature difference)\nFarsi word: نمی\u200Cدانم (I don\'t know)', 
    usage: 'Critical for Persian, Arabic, Devanagari scripts. Prevents unwanted letter joining while maintaining proper spacing.' 
  },
  '\u200D': { 
    desc: 'Zero-width Joiner', 
    code: 'U+200D', 
    display: 'ZWJ', 
    fullText: 'Zero-width Joiner', 
    example: 'Family emoji: 👨\u200D👩\u200D👧\u200D👦 (man+woman+girl+boy)\nProfession: 👨\u200D⚕️ (doctor) vs 👨 ⚕️ (separate)\nArabic: ل\u200Dا creates ligature', 
    usage: 'Forms complex emoji sequences and ligatures. Essential for emoji families, skin tones, and connecting Arabic characters.' 
  },
  '\u200E': { 
    desc: 'Left-to-right Mark', 
    code: 'U+200E', 
    display: 'LRM', 
    fullText: 'Left-to-right Mark', 
    example: 'Arabic with number: مرحبا\u200E 123 (correct) vs مرحبا 123 (may reverse)\nEmail in RTL: البريد: user@\u200Eexample.com\nMixed: שלום\u200E, how are you?', 
    usage: 'Forces LTR direction for numbers, emails, URLs in RTL text (Arabic, Hebrew). Prevents display corruption.' 
  },
  '\u200F': { 
    desc: 'Right-to-left Mark', 
    code: 'U+200F', 
    display: 'RLM', 
    fullText: 'Right-to-left Mark', 
    example: 'Price in Hebrew: המחיר:\u200F $99.99 (keeps $ on right)\nEnglish with RTL punctuation: Hello\u200F, שלום\nDate: התאריך:\u200F 23/11/2024', 
    usage: 'Forces RTL direction for punctuation and numbers in bidirectional text. Critical for Hebrew/Arabic localization.' 
  },
  '\u202A': { 
    desc: 'Left-to-right Embedding', 
    code: 'U+202A', 
    display: 'LRE', 
    fullText: 'Left-to-right Embedding', 
    example: 'Arabic text with URL: زيارة \u202Ahttps://example.com/page\u202C للمزيد\nRTL with LTR: العنوان \u202A123 Main Street\u202C في المدينة', 
    usage: 'Embeds LTR text section within RTL content. Must be closed with PDF (U+202C). Use for URLs in Arabic text.' 
  },
  '\u202B': { 
    desc: 'Right-to-left Embedding', 
    code: 'U+202B', 
    display: 'RLE', 
    fullText: 'Right-to-left Embedding', 
    example: 'English with Hebrew quote: He said \u202Bשלום עולם\u202C which means "hello world"\nLTR with RTL: The word is \u202Bمرحبا\u202C in Arabic', 
    usage: 'Embeds RTL text section within LTR content. Requires PDF (U+202C) to close. Use for Hebrew/Arabic quotes.' 
  },
  '\u202C': { 
    desc: 'Pop Directional Formatting', 
    code: 'U+202C', 
    display: 'PDF', 
    fullText: 'Pop Directional Formatting', 
    example: 'Normal text \u202AMixed direction content here\u202C back to normal\nNested: Start \u202BLTR \u202ARTL inside\u202C end LTR\u202C back to start', 
    usage: 'Closes LRE, RLE, LRO, or RLO. Essential pair with bidirectional formatting. Missing PDF causes layout issues.' 
  },
  '\u202D': { 
    desc: 'Left-to-right Override', 
    code: 'U+202D', 
    display: 'LRO', 
    fullText: 'Left-to-right Override', 
    example: 'Force Hebrew LTR: \u202D!שלום עולם\u202C shows as !םלוע םולש (reversed)\nOverride Arabic: \u202Dمرحبا 123\u202C all displays left-to-right', 
    usage: 'Forces all text LTR regardless of character properties. Stronger than LRM. Use with caution, always close with PDF.' 
  },
  '\u202E': { 
    desc: 'Right-to-left Override', 
    code: 'U+202E', 
    display: 'RLO', 
    fullText: 'Right-to-left Override', 
    example: 'Reverse English: \u202EHello World!\u202C displays as !dlroW olleH\nReverse URL: \u202Eexample.com\u202C shows as moc.elpmaxe (security risk!)', 
    usage: 'Forces all text RTL regardless of properties. Can reverse entire strings. Security risk if misused (spoofing).' 
  },
  '\uFEFF': { 
    desc: 'Zero-width No-break Space', 
    code: 'U+FEFF', 
    display: 'BOM', 
    fullText: 'Zero-width No-break Space (BOM)', 
    example: '\uFEFF<?xml version="1.0" encoding="UTF-8"?>\n\uFEFF{"name": "config", "type": "UTF-8"}\nFile starts with BOM: \uFEFFThis is the first line', 
    usage: 'Byte Order Mark at file start signals UTF encoding. Also prevents word breaks. May cause parsing errors if unexpected.' 
  },
  '\u2060': { 
    desc: 'Word Joiner', 
    code: 'U+2060', 
    display: 'WJ', 
    fullText: 'Word Joiner', 
    example: 'Keep\u2060together without visible space\nVersion\u20601.0.2\nISBN\u2060978-3-16-148410-0', 
    usage: 'Zero-width non-breaking character. Prevents line breaks without adding visible space. Useful in technical docs and version numbers.' 
  },
  '\u2007': { 
    desc: 'Figure Space', 
    code: 'U+2007', 
    display: 'FIGSP', 
    fullText: 'Figure Space', 
    example: 'Align numbers:\n\u2007\u2007123.45\n\u20071,234.56\n123,456.78', 
    usage: 'Same width as digits (0-9). Used to align numbers in tables and financial data. Essential for tabular localization.' 
  },
  '\u2009': { 
    desc: 'Thin Space', 
    code: 'U+2009', 
    display: 'THNSP', 
    fullText: 'Thin Space', 
    example: 'French punctuation\u2009: «\u2009Bonjour\u2009»\nQuestion\u2009?\nExclamation\u2009!', 
    usage: 'Narrower than normal space. Standard in French typography before punctuation (? ! ; :) and inside guillemets.' 
  },
  '\u202F': { 
    desc: 'Narrow No-break Space', 
    code: 'U+202F', 
    display: 'NNBSP', 
    fullText: 'Narrow No-break Space', 
    example: 'French: 123\u202F456\u202F789\nPercentage: 99\u202F%\nTime: 14\u202Fh\u202F30\nPrice: 1\u202F234,56\u202F€', 
    usage: 'Required in French localization for: thousand separators (123 456), percentages (99 %), units (14 h), currency.' 
  },
  '\u180E': { 
    desc: 'Mongolian Vowel Separator', 
    code: 'U+180E', 
    display: 'MVS', 
    fullText: 'Mongolian Vowel Separator', 
    example: 'Mongolian text with vowel separator\u180E(invisible formatting)', 
    usage: 'Mongolian script-specific character. Indicates vowel separation. Rarely needed but critical for Mongolian localization.' 
  },
  '\u2002': { 
    desc: 'En Space', 
    code: 'U+2002', 
    display: 'ENSP', 
    fullText: 'En Space', 
    example: 'Typography:\u2002En-width spacing\nDates:\u2002Jan\u20021–15,\u20022024', 
    usage: 'Width of lowercase "n". Used in professional typography and publishing. Common in date ranges and lists.' 
  },
  '\u2003': { 
    desc: 'Em Space', 
    code: 'U+2003', 
    display: 'EMSP', 
    fullText: 'Em Space', 
    example: 'Typography:\u2003Em-width spacing (wider)\nParagraph:\u2003Indented first line', 
    usage: 'Width of uppercase "M". Widest standard space. Used for paragraph indentation and professional typesetting.' 
  },
  '\u2004': { 
    desc: 'Three-Per-Em Space', 
    code: 'U+2004', 
    display: '3/M', 
    fullText: 'Three-Per-Em Space', 
    example: 'Fine\u2004spacing\u2004control\nList:\u2004Item\u20041,\u2004Item\u20042', 
    usage: 'One-third of an em width. Precise spacing control in professional typography and desktop publishing.' 
  },
  '\u2005': { 
    desc: 'Four-Per-Em Space', 
    code: 'U+2005', 
    display: '4/M', 
    fullText: 'Four-Per-Em Space', 
    example: 'Tighter\u2005spacing\u2005control\nNumbers:\u20051,234\u2005567', 
    usage: 'One-quarter of an em width. Fine-grained spacing for professional layouts and justified text.' 
  },
  '\u2006': { 
    desc: 'Six-Per-Em Space', 
    code: 'U+2006', 
    display: '6/M', 
    fullText: 'Six-Per-Em Space', 
    example: 'Very\u2006fine\u2006spacing\nAbbrev.:\u2006Dr.\u2006Smith', 
    usage: 'One-sixth of an em width. Finest spacing control in professional typography. Used in abbreviations and initials.' 
  },
  '\u2066': { 
    desc: 'Left-to-right Isolate', 
    code: 'U+2066', 
    display: 'LRI', 
    fullText: 'Left-to-right Isolate', 
    example: 'Modern RTL: Arabic text \u2066LTR content here\u2069 continues\nURL in RTL: Visit \u2066example.com\u2069 now', 
    usage: 'Modern replacement for LRE (U+202A). Better isolation of LTR text in RTL context. Requires PDI (U+2069) to close.' 
  },
  '\u2067': { 
    desc: 'Right-to-left Isolate', 
    code: 'U+2067', 
    display: 'RLI', 
    fullText: 'Right-to-left Isolate', 
    example: 'Modern LTR: English text \u2067مرحبا بك\u2069 continues\nQuote: He said \u2067שלום\u2069 to everyone', 
    usage: 'Modern replacement for RLE (U+202B). Better isolation of RTL text in LTR context. Requires PDI (U+2069) to close.' 
  },
  '\u2068': { 
    desc: 'First Strong Isolate', 
    code: 'U+2068', 
    display: 'FSI', 
    fullText: 'First Strong Isolate', 
    example: 'Auto-detect: \u2068Could be LTR or RTL\u2069 text\nSmart: \u2068مرحبا\u2069 or \u2068Hello\u2069', 
    usage: 'Automatically detects text direction from first strong directional character. Most flexible modern bidirectional control.' 
  },
  '\u2069': { 
    desc: 'Pop Directional Isolate', 
    code: 'U+2069', 
    display: 'PDI', 
    fullText: 'Pop Directional Isolate', 
    example: 'Close isolate: \u2066LTR text\u2069 back to normal\nNested: \u2067RTL \u2066inner LTR\u2069 back to RTL\u2069 normal', 
    usage: 'Closes LRI, RLI, or FSI. Modern replacement for PDF (U+202C). Essential pair with Unicode 6.3+ isolate characters.' 
  },
}

// Generate colors for each special character - more distinguishable
const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA', '#F1948A', '#85C1E9',
  '#D7BDE2', '#AED6F1', '#A3E4D7', '#F9E79F', '#D2B4DE', '#FF8C94', '#A8E6CF',
  '#FFD3B6', '#FFAAA5', '#FF8B94', '#C7CEEA', '#B5EAD7', '#E2F0CB', '#FFDAC1',
  '#D4A5A5', '#9CADCE', '#E8DFF5'
]

function TextAnalyzer() {
  const [text, setText] = useState('')
  const [history, setHistory] = useState([''])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [highlightVisibility, setHighlightVisibility] = useState({})
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [selectedChar, setSelectedChar] = useState(null)
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 })
  const [textareaRef, setTextareaRef] = useState(null)
  const [replaceModal, setReplaceModal] = useState({ visible: false, char: null })
  const [replaceWith, setReplaceWith] = useState('')
  const [bidiPreview, setBidiPreview] = useState('ltr')
  const [showCharSelector, setShowCharSelector] = useState(false)
  const [showInsertMenu, setShowInsertMenu] = useState(false)

  const highlightedText = useMemo(() => {
    if (!text) return text
    const parts = []
    let lastIndex = 0
    const regex = /[\t\n\r\u00A0\u200B\u00AD\u2028\u2029\u200C\u200D\u200E\u200F\u202A\u202B\u202C\u202D\u202E\uFEFF\u2060\u2007\u2009\u202F\u180E\u2002\u2003\u2004\u2005\u2006\u2066\u2067\u2068\u2069]/g
    let match
    let colorIndex = 0
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }
      const char = match[0]
      const info = specialChars[char] || { desc: 'Special Character', code: `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`, display: char }
      const isVisible = highlightVisibility[char] !== false
      if (isVisible) {
        const charIndex = Object.keys(specialChars).indexOf(char)
        const color = colors[charIndex % colors.length]
        parts.push(
          <span
            key={match.index}
            className="special-char"
            data-tooltip-id="special-tooltip"
            data-tooltip-content={`${info.desc} (${info.code}) - Click for info`}
            onClick={() => {
              setSelectedChar(char)
              setShowInfoModal(true)
            }}
            style={{ backgroundColor: color, border: `1px solid ${color}aa`, borderRadius: '2px', cursor: 'pointer' }}
          >
            {info.display}
          </span>
        )
      } else {
        parts.push(char)
      }
      lastIndex = regex.lastIndex
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }
    return parts
  }, [text, highlightVisibility])

  const charCounts = useMemo(() => {
    const counts = {}
    for (const char of text) {
      if (specialChars[char] && /[\t\n\r\u00A0\u200B\u00AD\u2028\u2029\u200C\u200D\u200E\u200F\u202A\u202B\u202C\u202D\u202E\uFEFF\u2060\u2007\u2009\u202F\u180E\u2002\u2003\u2004\u2005\u2006\u2066\u2067\u2068\u2069]/.test(char)) {
        counts[char] = (counts[char] || 0) + 1
      }
    }
    return counts
  }, [text])

  const insertSpecialChar = (char) => {
    const newText = text.slice(0, cursorPosition) + char + text.slice(cursorPosition)
    setText(newText)
    const newCursorPos = cursorPosition + char.length
    setCursorPosition(newCursorPos)
    
    // Add to history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newText)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    
    // Set cursor position in the textarea after state updates
    setTimeout(() => {
      if (textareaRef) {
        textareaRef.focus()
        textareaRef.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  const toggleHighlight = (char) => {
    setHighlightVisibility(prev => ({
      ...prev,
      [char]: prev[char] === false ? true : false
    }))
  }

  const handleTextChange = (e) => {
    const newText = e.target.value
    setText(newText)
    setCursorPosition(e.target.selectionStart)
    
    // Add to history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newText)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setText(history[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setText(history[historyIndex + 1])
    }
  }

  const handleCopyOriginal = () => {
    navigator.clipboard.writeText(text)
  }

  const handleCopyHighlighted = () => {
    // Copy the text with special character markers
    let textWithMarkers = text
    Object.entries(specialChars).forEach(([char, info]) => {
      const regex = new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      textWithMarkers = textWithMarkers.replace(regex, `[${info.display}]`)
    })
    navigator.clipboard.writeText(textWithMarkers)
  }

  const openReplaceModal = (char) => {
    setReplaceModal({ visible: true, char })
    setReplaceWith('')
  }

  const handleReplaceAll = () => {
    if (replaceModal.char && replaceWith !== undefined) {
      const newText = text.split(replaceModal.char).join(replaceWith)
      setText(newText)
      
      // Add to history
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newText)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
      
      setReplaceModal({ visible: false, char: null })
      setReplaceWith('')
    }
  }

  const handleContextMenu = (e) => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY
    })
    setCursorPosition(e.target.selectionStart)
  }

  const handleInsertFromContext = (char) => {
    insertSpecialChar(char)
    setContextMenu({ visible: false, x: 0, y: 0 })
    if (textareaRef) {
      textareaRef.focus()
    }
  }

  const handleInsertFromUtilityBar = (char) => {
    insertSpecialChar(char)
    setShowInsertMenu(false)
    if (textareaRef) {
      textareaRef.focus()
    }
  }

  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0 })
  }

  const handleCloseInsertMenu = () => {
    setShowInsertMenu(false)
  }

  return (
    <main className="page" onClick={() => {
      handleCloseContextMenu()
      handleCloseInsertMenu()
    }}>
      <header className="page-header">
        <div className="page-header-left">
          <h1>Text Analyzer</h1>
          <div className="utility-icons">
            <div className="insert-menu-container">
              <button 
                className="utility-icon-btn icon-insert" 
                onClick={(e) => {
                  e.stopPropagation()
                  setShowInsertMenu(!showInsertMenu)
                }}
                title="Insert special character"
                aria-label="Insert special character"
              >
              </button>
              {showInsertMenu && (
                <div className="insert-dropdown" onClick={(e) => e.stopPropagation()}>
                  {Object.entries(specialChars).map(([char, info]) => (
                    <div
                      key={char}
                      className="insert-dropdown-item"
                      onClick={() => handleInsertFromUtilityBar(char)}
                    >
                      <span className="insert-dropdown-char">{info.display}</span>
                      <span className="insert-dropdown-desc">{info.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button 
              className="utility-icon-btn icon-search" 
              onClick={() => setShowCharSelector(!showCharSelector)}
              title="Find & Replace"
              aria-label="Find & Replace"
            >
            </button>
            <div className="utility-divider"></div>
            <button 
              className={`utility-icon-btn icon-align-left ${bidiPreview === 'ltr' ? 'active' : ''}`}
              onClick={() => setBidiPreview('ltr')}
              title="Left-to-Right preview"
              aria-label="Left-to-Right"
            >
            </button>
            <button 
              className={`utility-icon-btn icon-align-right ${bidiPreview === 'rtl' ? 'active' : ''}`}
              onClick={() => setBidiPreview('rtl')}
              title="Right-to-Left preview"
              aria-label="Right-to-Left"
            >
            </button>
            <div className="utility-divider"></div>
            <button 
              className="utility-icon-btn" 
              onClick={handleUndo} 
              disabled={historyIndex === 0}
              title="Undo"
              aria-label="Undo"
            >
              ↶
            </button>
            <button 
              className="utility-icon-btn" 
              onClick={handleRedo} 
              disabled={historyIndex === history.length - 1}
              title="Redo"
              aria-label="Redo"
            >
              ↷
            </button>
          </div>
        </div>
        <div className="page-header-stats">
          <span className="stat-badge">{text.length} Characters</span>
          {Object.keys(charCounts).length > 0 && (
            <span className="stat-badge">{Object.keys(charCounts).length} Special chars</span>
          )}
        </div>
      </header>

      <section className="editor-row">
        <article className="editor-panel">
          <header className="editor-header">
            <span className="editor-title">Original text</span>
            <div className="editor-header-actions">
              <span className="editor-hint">Right-click to insert special characters</span>
              <button 
                className="copy-btn" 
                onClick={handleCopyOriginal}
                title="Copy original text"
                aria-label="Copy original text"
              >
                📋 Copy
              </button>
            </div>
          </header>
          <textarea
            ref={(el) => setTextareaRef(el)}
            className="editor-textarea"
            value={text}
            onChange={handleTextChange}
            onSelect={(e) => setCursorPosition(e.target.selectionStart)}
            onContextMenu={handleContextMenu}
            placeholder="Paste or type your text here to analyze special characters..."
            aria-label="Original text for analysis"
            style={{ direction: bidiPreview }}
          />
        </article>

        <article className="editor-panel">
          <header className="editor-header">
            <span className="editor-title">Highlighted output</span>
            <div className="editor-header-actions">
            <span className="editor-hint">Click special characters for more info</span>

              <button 
                className="copy-btn" 
                onClick={handleCopyHighlighted}
                title="Copy with markers"
                aria-label="Copy text with special character markers"
              >
                📋 Copy with markers
              </button>
            </div>
          </header>
          <div className="highlighted-display" style={{ direction: bidiPreview }}>
            {highlightedText}
          </div>
        </article>
      </section>

      <section className="extras">
        {/* Currently Used Characters */}
        {Object.keys(charCounts).length > 0 && (
          <div className="special-chars-section" role="region" aria-label="Currently used special characters">
            <div className="section-header">
              <h3>Currently Used ({Object.keys(charCounts).length})</h3>
            </div>
            <div className="special-chars-grid">
              {Object.entries(specialChars)
                .filter(([char]) => charCounts[char] > 0)
                .map(([char, info]) => {
                  const charIndex = Object.keys(specialChars).indexOf(char)
                  const color = colors[charIndex % colors.length]
                  const count = charCounts[char] || 0
                  return (
                    <div key={char} className="char-card">
                      <div className="char-card-header">
                        <span className="char-display" style={{ color: color }}>
                          {info.display}
                        </span>
                        <span className={`char-count-badge ${count > 0 ? 'active' : ''}`}>
                          {count}
                        </span>
                      </div>
                      <div className="char-description">{info.desc}</div>
                      <div className="char-code">{info.code}</div>
                      <div className="char-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => insertSpecialChar(char)}
                          title="Insert character at cursor"
                        >
                          Insert
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => openReplaceModal(char)}
                          title="Find and replace all instances"
                        >
                          Replace
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setSelectedChar(char)
                            setShowInfoModal(true)
                          }}
                          title="More information"
                        >
                          Info
                        </button>
                        <button
                          className={`btn btn-secondary ${highlightVisibility[char] === false ? '' : 'active'}`}
                          onClick={() => toggleHighlight(char)}
                          title={highlightVisibility[char] === false ? 'Show highlighting' : 'Hide highlighting'}
                        >
                          {highlightVisibility[char] === false ? 'Show' : 'Hide'}
                        </button>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Additional Characters */}
        <div className="special-chars-section" style={{ marginTop: Object.keys(charCounts).length > 0 ? '24px' : '0' }} role="region" aria-label="Additional special characters">
          <div className="section-header">
            <h3>{Object.keys(charCounts).length > 0 ? `Additional Characters (${Object.keys(specialChars).length - Object.keys(charCounts).length})` : `Special Characters (${Object.keys(specialChars).length})`}</h3>
          </div>
          <div className="special-chars-grid">
            {Object.entries(specialChars)
              .filter(([char]) => !charCounts[char] || charCounts[char] === 0)
              .map(([char, info]) => {
              const charIndex = Object.keys(specialChars).indexOf(char)
              const color = colors[charIndex % colors.length]
            const count = charCounts[char] || 0
            return (
              <div key={char} className="char-card">
                <div className="char-card-header">
                  <span className="char-display" style={{ color: color }}>
                    {info.display}
                  </span>
                  <span className={`char-count-badge ${count > 0 ? 'active' : ''}`}>
                    {count > 0 ? count : 0}
                  </span>
                </div>
                <div className="char-description">{info.desc}</div>
                <div className="char-code">{info.code}</div>
                <div className="char-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => insertSpecialChar(char)}
                    title="Insert character at cursor"
                  >
                    Insert
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedChar(char)
                      setShowInfoModal(true)
                    }}
                    title="More information"
                  >
                    Info
                  </button>
                  <button
                    className={`btn btn-secondary ${highlightVisibility[char] === false ? '' : 'active'}`}
                    onClick={() => toggleHighlight(char)}
                    title={highlightVisibility[char] === false ? 'Show highlighting' : 'Hide highlighting'}
                  >
                    {highlightVisibility[char] === false ? 'Show' : 'Hide'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        </div>
      </section>

      {showInfoModal && selectedChar && (
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
                <pre className="example-text">{specialChars[selectedChar].example}</pre>
              </div>
              <div className="modal-section">
                <div className="modal-button-group">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedChar)
                      alert('Character copied to clipboard!')
                    }}
                  >
                    Copy Character
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setShowInfoModal(false)
                      openReplaceModal(selectedChar)
                    }}
                  >
                    Find & Replace
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {contextMenu.visible && (
        <div 
          className="context-menu"
          style={{ 
            position: 'fixed', 
            top: contextMenu.y, 
            left: contextMenu.x,
            zIndex: 1000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="context-menu-header">Insert Special Character</div>
          <div className="context-menu-items">
            {Object.entries(specialChars).map(([char, info]) => (
              <div
                key={char}
                className="context-menu-item"
                onClick={() => handleInsertFromContext(char)}
              >
                <span className="context-menu-char">{info.display}</span>
                <span className="context-menu-desc">{info.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {replaceModal.visible && replaceModal.char && (
        <div className="modal-overlay" onClick={() => setReplaceModal({ visible: false, char: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Find & Replace</h2>
              <button className="modal-close" onClick={() => setReplaceModal({ visible: false, char: null })}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-section">
                <h3>Replace all instances of:</h3>
                <div className="replace-char-display">
                  <span className="char-display-large">{specialChars[replaceModal.char].display}</span>
                  <span className="char-desc">{specialChars[replaceModal.char].desc}</span>
                  <span className="char-count">Found: {charCounts[replaceModal.char] || 0} times</span>
                </div>
              </div>
              <div className="modal-section">
                <h3>Replace with:</h3>
                <div className="replace-options">
                  <div className="replace-input-row">
                    <input
                      type="text"
                      className="replace-input"
                      value={replaceWith}
                      onChange={(e) => setReplaceWith(e.target.value)}
                      placeholder="Type or select from dropdown"
                      autoFocus
                    />
                    <select 
                      className="replace-dropdown"
                      value=""
                      onChange={(e) => {
                        if (e.target.value === 'DELETE') {
                          setReplaceWith('')
                        } else if (e.target.value === 'SPACE') {
                          setReplaceWith(' ')
                        } else {
                          setReplaceWith(e.target.value)
                        }
                      }}
                    >
                      <option value="">-- Select character --</option>
                      <option value="SPACE">Regular Space</option>
                      <option value="DELETE">Delete (empty)</option>
                      <optgroup label="Special Characters">
                        {Object.entries(specialChars).map(([char, info]) => (
                          <option key={char} value={char}>
                            {info.display} - {info.desc}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-section">
                <div className="modal-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleReplaceAll}
                  >
                    Replace All ({charCounts[replaceModal.char] || 0})
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setReplaceModal({ visible: false, char: null })}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCharSelector && (
        <div className="modal-overlay" onClick={() => setShowCharSelector(false)}>
          <div className="modal char-selector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Find & Replace Characters</h2>
              <button className="modal-close" onClick={() => setShowCharSelector(false)}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-section">
                {Object.keys(charCounts).length > 0 ? (
                  <>
                    <p>Select a character to find and replace:</p>
                    <div className="char-selector-grid">
                      {Object.entries(specialChars)
                        .filter(([char]) => charCounts[char] > 0)
                        .map(([char, info]) => {
                          const count = charCounts[char]
                          return (
                            <div key={char} className="char-selector-item">
                              <div className="char-selector-display">{info.display}</div>
                              <div className="char-selector-info">
                                <div className="char-selector-desc">{info.desc}</div>
                                <div className="char-selector-count">Found: {count}</div>
                              </div>
                              <div className="char-selector-actions">
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => {
                                    setShowCharSelector(false)
                                    openReplaceModal(char)
                                  }}
                                  title="Find and replace"
                                >
                                  Replace
                                </button>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </>
                ) : (
                  <p style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-600)' }}>
                    No special characters found in your text. Type or paste text to begin analysis.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Tooltip id="special-tooltip" />
    </main>
  )
}

export default TextAnalyzer