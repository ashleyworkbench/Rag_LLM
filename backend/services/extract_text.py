import pymupdf
import pdfplumber
from docx import Document

def extract_from_pdf(filepath: str) -> str:
    """Try multiple extraction methods for maximum compatibility."""

    # Method 1: pdfplumber (best for most text PDFs)
    try:
        with pdfplumber.open(filepath) as pdf:
            text = "\n".join([p.extract_text() or "" for p in pdf.pages]).strip()
            if text:
                return text
    except Exception:
        pass

    # Method 2: PyMuPDF plain text
    try:
        doc = pymupdf.open(filepath)
        text = "".join([page.get_text() for page in doc]).strip()
        doc.close()
        if text:
            return text
    except Exception:
        pass

    # Method 3: PyMuPDF with "words" extraction
    try:
        doc = pymupdf.open(filepath)
        words = []
        for page in doc:
            words.extend([w[4] for w in page.get_text("words")])
        doc.close()
        text = " ".join(words).strip()
        if text:
            return text
    except Exception:
        pass

    return ""

def extract_from_docx(filepath: str) -> str:
    """Extract all text from a DOCX file."""
    doc = Document(filepath)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)

def extract_text(filepath: str) -> str:
    """Auto-detect file type and extract text."""
    if filepath.endswith(".pdf"):
        return extract_from_pdf(filepath)
    elif filepath.endswith(".docx"):
        return extract_from_docx(filepath)
    else:
        raise ValueError(f"Unsupported file type: {filepath}")
