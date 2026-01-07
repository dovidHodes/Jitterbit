# Jitterbit Mapping Rules

## Variable Scoping Rules

### Global Variables ($ prefix)
Variables that need to be accessed across different target nodes **must** use the `$` prefix.

**Rule**: If a variable is used outside of its target node scope, it must be prefixed with `$`.

**Example:**
```javascript
// ✅ CORRECT - Global variable accessible across nodes
$currentPallet = $pallet_array_object["pallets"][$palletIterator];
$currentPalletSSCC = $currentPallet["sscc"];

// ❌ WRONG - Local variable, not accessible in other nodes
currentPallet = pallet_array_object["pallets"][$palletIterator];
```

**When to use `$` prefix:**
- Variables used in multiple target node mappings
- Variables declared in initialization (ISA01_Info_Qualifier) and used later
- Iterator variables that persist across iterations
- Any variable that needs to be shared between parent and child nodes

**When NOT to use `$` prefix:**
- Temporary variables used only within a single target node script
- Loop counters used only within a single while loop
- Variables that are immediately consumed and not needed elsewhere

---

## Source Nodes for Looping

### Rule: Need a Source from Record to Initiate Looping

To create a loop in Jitterbit mappings, you **must** reference a source field from the record that contains a list/sublist. This tells Jitterbit how many times to iterate.

**Pattern:**
```javascript
$sourceField = searchResponse$searchResult$recordList$record.ItemFulfillment$listName$item.fieldName$;
```

**Examples:**

#### Pallet-Level Loop
```javascript
// Source node to initiate pallet loop
$trackingNumFromIFItself = searchResponse$searchResult$recordList$record.ItemFulfillment$packageList$package.packageTrackingNumber$;
```

#### Item-Level Loop
```javascript
// Source node to initiate item loop
$itemFromIF = searchResponse$searchResult$recordList$record.ItemFulfillment$itemList$item.item$internalId$;
```

**Why it's needed:**
- Jitterbit uses the source field to determine how many iterations to perform
- Without a source node, the mapping doesn't know when to loop
- The source field doesn't have to be used in the output, but it must be referenced to create the loop

**Common Source Patterns:**
- `packageList$package.packageTrackingNumber$` - For package/pallet loops
- `itemList$item.item$internalId$` - For item loops
- `customFieldList$CustomField$value$` - For custom field loops

---

## Variable Declaration Rules

### Rule: Don't Need to Declare Variables Before Assigning

In Jitterbit, you can directly assign values to `$variables` without declaring them first.

**✅ CORRECT - Direct Assignment:**
```javascript
// No need to declare first - just assign directly
$PO_LineItemNUmber = $currentItem["poLineNumber"];
$currentPalletSSCC = $currentPallet["sscc"];
$VPN = $currentItem["vpn"];
```

**❌ UNNECESSARY - Pre-declaration:**
```javascript
// Don't need to do this:
$PO_LineItemNUmber = 0;  // Unnecessary declaration
$PO_LineItemNUmber = $currentItem["poLineNumber"];  // Then assign

// Just do this:
$PO_LineItemNUmber = $currentItem["poLineNumber"];
```

**Exception:**
- You may want to initialize iterators to 0:
  ```javascript
  $palletIterator = 0;  // Initialize iterator
  $itemIterator = 0;    // Initialize iterator
  ```

---

## Best Practices

### 1. Declare Shared Data Once
If you need to access the same data in multiple child nodes, declare it once in the parent node.

**Example:**
```javascript
// In HL03_Hierarchical_Level_Code (pallet header):
$currentPallet = $pallet_array_object["pallets"][$palletIterator];
$currentPalletSSCC = $currentPallet["sscc"];
$currentPalletId = $currentPallet["palletId"];

// Then in child nodes, just use $currentPallet directly:
$currentItem = $currentPallet["items"][$itemIterator];  // Reuse $currentPallet
```

### 2. Use Conditions to Control Looping
Add condition nodes to control when child nodes should execute.

**Example:**
```javascript
// Condition node: HL#1.
$palletIterator < $totalPallets

// Condition node: HL#1/HL/HL.
$itemIterator < Length($currentPallet["items"])
```

### 3. Initialize Iterators Properly
- Initialize iterators to 0 at the start
- Increment iterators in the appropriate parent ID node
- Reset nested iterators when starting a new parent iteration

**Example:**
```javascript
// Initialize pallet iterator
$palletIterator = 0;

// In pallet header, reset item iterator
$itemIterator = 0;

// Increment pallet iterator
$palletIterator++;

// Increment item iterator
$itemIterator++;
```

---

## Common Patterns

### Pattern 1: JSON Data Processing
```javascript
// Initialize (ISA01_Info_Qualifier):
$pallet_array_object = JSONParser(pallet_array_JSON);
$totalPallets = $pallet_array_object["totalPallets"];

// In loop header (HL03_Hierarchical_Level_Code):
$currentPallet = $pallet_array_object["pallets"][$palletIterator];

// In child nodes:
$currentItem = $currentPallet["items"][$itemIterator];
```

### Pattern 2: Source Node + Condition
```javascript
// Source node to initiate loop:
$sourceField = searchResponse$searchResult$recordList$record.ItemFulfillment$listName$item.field$;

// Condition to control loop:
$iterator < $totalCount
```

### Pattern 3: Hierarchical ID Calculation
```javascript
// Calculate hierarchical ID based on iterator
$HLPIterator = ($palletIterator * 2) + 1;
```

---

## Summary Checklist

When creating a mapping with loops:

- [ ] Use `$` prefix for all variables used across multiple target nodes
- [ ] Add a source node reference to initiate each loop level
- [ ] Declare shared data (like `$currentPallet`) once in the parent node
- [ ] Add condition nodes to control when loops execute
- [ ] Initialize iterators to 0 at the start
- [ ] Increment iterators in the appropriate parent ID nodes
- [ ] Reset nested iterators when starting new parent iterations
- [ ] Don't pre-declare variables - assign directly with `$variable = value`

---

## Notes

- Variables without `$` are local to the target node script
- Variables with `$` are global and persist across target nodes
- Source nodes are required for Jitterbit to know how many times to loop
- JSON parsing creates dictionary objects that can be accessed with bracket notation
- Always use `$` prefix when accessing JSON data that will be used in multiple nodes

