"""
Design Tokens - Python mirror of tokens.css
Single source of truth for the Incrementum color system in Python services.

This file mirrors /Incrementum.client/src/styles/tokens.css
Keep these values synchronized when updating the design system.
"""

# ═══════════════════════════════════════════════════════════════════
# Dark Mode Theme (Default)
# ═══════════════════════════════════════════════════════════════════

DARK_THEME = {
    # Backgrounds
    "BG_BASE": "#1A1C1A",           # page / outermost background
    "BG_SURFACE": "#5E6960",        # cards, panels, modals
    "BG_SUNKEN": "#454C45",         # sidebar, secondary panels
    "BG_ROW_ALT": "#3E4A3D",        # alternating table rows
    
    # Text
    "TEXT_PRIMARY": "#B8D4A8",      # standard body / label text
    "TEXT_SECONDARY": "#D5E8CC",    # headers, prominent labels
    "TEXT_MUTED": "#8FA88A",        # de-emphasised / placeholder text
    "TEXT_ON_ACCENT": "#1A1C1A",    # text placed on green buttons
    
    # Accent / Interactive
    "ACCENT": "#66BB6A",            # primary buttons, active states
    "ACCENT_HOVER": "#8FDA7C",      # button hover
    "ACCENT_MUTED": "#4E4E4E",      # dotted borders, secondary outlines
    
    # Borders
    "BORDER_DIVIDER": "#454C45",    # section dividers
    "BORDER_CARD": "#4E4E4E",       # card dotted borders
    
    # Status
    "STATUS_ERROR": "#ef4444",      # error / destructive red
    "STATUS_ERROR_HOVER": "#dc2626",
    "STATUS_SUCCESS": "#66BB6A",
}

# ═══════════════════════════════════════════════════════════════════
# Light Mode Theme
# ═══════════════════════════════════════════════════════════════════

LIGHT_THEME = {
    # Backgrounds
    "BG_BASE": "#E1EFE2",           # page / outermost background
    "BG_SURFACE": "#CAE0CB",        # cards, panels, modals
    "BG_SUNKEN": "#D5E3D1",         # navbar, sidebar, secondary panels
    "BG_ROW_ALT": "#D8E8D9",        # alternating table rows
    
    # Text
    "TEXT_PRIMARY": "#0E250E",      # standard body / label text
    "TEXT_SECONDARY": "#0A2207",    # headers, prominent labels
    "TEXT_MUTED": "#5C5C5C",        # de-emphasised / placeholder text
    "TEXT_ON_ACCENT": "#FFFFFF",    # text placed on green buttons
    
    # Accent / Interactive
    "ACCENT": "#66BB6A",            # primary buttons, active states
    "ACCENT_HOVER": "#4CAF50",      # button hover
    "ACCENT_MUTED": "#A0A0A0",      # dotted borders, secondary outlines
    
    # Borders
    "BORDER_DIVIDER": "#A8C9A9",    # section dividers
    "BORDER_CARD": "#B0D0B1",       # card dotted borders
    
    # Status
    "STATUS_ERROR": "#D32F2F",      # error / destructive red
    "STATUS_ERROR_HOVER": "#B71C1C",
    "STATUS_SUCCESS": "#66BB6A",
}

# ═══════════════════════════════════════════════════════════════════
# Helper function to get theme colors
# ═══════════════════════════════════════════════════════════════════


def get_theme(theme_name="dark"):
    """Get theme colors based on theme name (light or dark)"""
    return LIGHT_THEME if theme_name == "light" else DARK_THEME


# Default exports (dark theme for backward compatibility)
BG_BASE = DARK_THEME["BG_BASE"]
BG_SURFACE = DARK_THEME["BG_SURFACE"]
BG_SUNKEN = DARK_THEME["BG_SUNKEN"]
BG_ROW_ALT = DARK_THEME["BG_ROW_ALT"]

TEXT_PRIMARY = DARK_THEME["TEXT_PRIMARY"]
TEXT_SECONDARY = DARK_THEME["TEXT_SECONDARY"]
TEXT_MUTED = DARK_THEME["TEXT_MUTED"]
TEXT_ON_ACCENT = DARK_THEME["TEXT_ON_ACCENT"]

ACCENT = DARK_THEME["ACCENT"]
ACCENT_HOVER = DARK_THEME["ACCENT_HOVER"]
ACCENT_MUTED = DARK_THEME["ACCENT_MUTED"]

BORDER_DIVIDER = DARK_THEME["BORDER_DIVIDER"]
BORDER_CARD = DARK_THEME["BORDER_CARD"]

STATUS_ERROR = DARK_THEME["STATUS_ERROR"]
STATUS_ERROR_HOVER = DARK_THEME["STATUS_ERROR_HOVER"]
STATUS_SUCCESS = DARK_THEME["STATUS_SUCCESS"]
