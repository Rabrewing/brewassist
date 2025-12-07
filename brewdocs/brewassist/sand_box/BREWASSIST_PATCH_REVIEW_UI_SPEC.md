# BrewAssist Patch Review Panel — UI Specification (Customer-Safe)

This is the panel customers see when BrewAssist proposes changes.

The sandbox remains internal and hidden.

---

## Customer Workflow

1. Customer asks:
   - “Fix this error”
   - “Refactor this file”
   - “Improve this function”
   - “Add validation logic”

2. BrewAssist runs chain + sandbox internally.

3. Customer sees ONLY:
   - Diff (left: before, right: after)
   - HRM explanation
   - Risk score
   - Apply or Reject buttons

4. If Apply:
   - BrewAssist writes to the real project  
   - BrewLast snapshot updated  
   - Audit entry generated  

---

## UI Elements

### Top Bar
- File Name  
- Path  
- BrewAssist Tier  
- Risk Level (Low/Medium/High)  

### Middle Section
- **Unified Diff Viewer**
- Syntax highlighting  
- Color-coded patch markers  
- Collapsible sections  

### Bottom Section
- “Explain this patch”  
- “Show risk analysis”  
- “Apply Patch” button  
- “Reject & Close”  

---

## No raw sandbox output is shown to customers.
