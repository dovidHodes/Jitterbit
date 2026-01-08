# TODO

## Helper Functions

- [ ] Create helper function to validate NS fields (check if empty or null) and set Jitterbit error message accordingly. Function should accept fieldName (for setting error message) and fieldValue as parameters.

- [ ] Create helper function to initialize ISA details. Function should return a JSON object containing control version, ISA IDs, and other ISA segment details. Call once at top level to reduce redundant declarations.

- [ ] Create helper function to set standard ASN (856) fields that vary between trading partners. Centralize common field mappings to reduce duplication.

- [ ] Create helper function to set standard 850 (PO) fields that vary between trading partners. Include fields such as entity, fulfillment status, location, etc.

- [ ] Create prompt template for Cursor AI with prefilled variables for creating new mappings. Template should prompt Cursor to configure fields using the helper functions above.

