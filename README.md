# Loc_tool - Localization Text Analysis Tool

A professional web application designed for localization professionals to analyze and compare text content, with special focus on special characters and bidirectional text support.

## 🌟 Features

- **Text Analysis**: Analyze text for special characters with detailed metadata
- **Dual-Panel Comparison**: Side-by-side text comparison with visual diff highlighting
- **Special Characters Database**: 32+ special characters with descriptions, codes, and usage examples
- **Find & Replace**: Interactive find and replace functionality for special characters
- **Bidirectional Text Support**: LTR/RTL text preview with alignment controls
- **Undo/Redo**: Full history tracking for all text changes
- **Copy Functions**: Easy copy buttons for plain text and highlighted text
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Live Demo

Visit the live application: [https://naji-naji.github.io/Loc_tool/](https://naji-naji.github.io/Loc_tool/)

## 🛠️ Tech Stack

- **Frontend**: React 19 with Vite
- **Styling**: Custom CSS with modern design system
- **Libraries**:
  - `react-diff-viewer` - Visual text comparison
  - `react-tooltip` - Interactive tooltips
  - `fast-levenshtein` - Text similarity scoring
  - `dompurify` - XSS protection

## 📋 Special Characters Supported

The tool includes comprehensive support for 32+ special characters including:
- Quotes (smart, curly, angled)
- Dashes (en, em, figure)
- Spaces (non-breaking, thin, hair)
- Mathematical symbols
- Currency symbols
- And many more...

Each character includes metadata: description, Unicode code, display format, and usage examples.

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/naji-naji/Loc_tool.git
cd Loc_tool
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open [http://localhost:5174](http://localhost:5174) in your browser

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## 📖 Usage Guide

### Basic Text Analysis
1. Paste or type text in either panel
2. View highlighted special characters with tooltips
3. See character counts and analysis summary

### Find & Replace
1. Click the search icon (⌕) in the utility bar
2. Select a special character from the list
3. Choose replacement text or select from dropdown
4. Click "Replace All" to apply changes

### Insert Special Characters
1. Click the plus icon (+) in the utility bar
2. Browse the dropdown menu of special characters
3. Click any character to insert at cursor position

### Bidirectional Text Preview
- Use the alignment icons (≡ for LTR, ≣ for RTL) to preview text direction
- Both panels update simultaneously for easy comparison

### Undo/Redo
- Use the circular arrow icons (↶ ↷) to navigate through text changes
- Full history is preserved during your session

## 🎨 UI Features

- **Collapsible Sidebar**: Clean interface with toggleable navigation
- **Utility Toolbar**: Quick access to all major functions
- **Modal Dialogs**: Clean, accessible modals for complex operations
- **Responsive Grid**: Character selection grids that adapt to screen size
- **Professional Styling**: Modern design with consistent spacing and colors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/) and [React](https://reactjs.org/)

---

**Made by [Naji Naji](https://www.linkedin.com/in/najinaji/)**
