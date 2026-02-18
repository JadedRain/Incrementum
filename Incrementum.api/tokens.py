"""
Design Tokens - Python mirror of tokens.css
Single source of truth for the Incrementum color system in Python services.

This file mirrors /Incrementum.client/src/styles/tokens.css
Keep these values synchronized when updating the design system.
"""

# Backgrounds
BG_BASE = "#1A1C1A"           # page / outermost background
BG_SURFACE = "#5E6960"        # cards, panels, modals
BG_SUNKEN = "#454C45"         # sidebar, secondary panels
BG_ROW_ALT = "#3E4A3D"        # alternating table rows

# Text
TEXT_PRIMARY = "#B8D4A8"      # standard body / label text
TEXT_SECONDARY = "#D5E8CC"    # headers, prominent labels
TEXT_MUTED = "#8FA88A"        # de-emphasised / placeholder text
TEXT_ON_ACCENT = "#1A1C1A"    # text placed on green buttons

# Accent / Interactive
ACCENT = "#66BB6A"            # primary buttons, active states
ACCENT_HOVER = "#8FDA7C"      # button hover
ACCENT_MUTED = "#4E4E4E"      # dotted borders, secondary outlines

# Borders
BORDER_DIVIDER = "#454C45"    # section dividers
BORDER_CARD = "#4E4E4E"       # card dotted borders

# Status
STATUS_ERROR = "#ef4444"      # error / destructive red
STATUS_ERROR_HOVER = "#dc2626"
STATUS_SUCCESS = "#66BB6A"
