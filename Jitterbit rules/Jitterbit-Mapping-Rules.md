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

## Case Statement Syntax

### Rule: Case Uses Boolean Conditions, Not String Matching

The Jitterbit `Case` function acts like a multi-branch IF/ELSE chain. Each condition must be a **boolean expression** that evaluates to true or false.

**Basic Case Syntax:**
```javascript
Case(
  <condition1>, <result1>,
  <condition2>, <result2>,
  ...,
  <conditionN>, <resultN>
)
```

**Key Points:**
- Each condition is a boolean expression (e.g., `field == "value"`, `success == true`, `count > 0`)
- The function returns the result paired with the **first** condition that evaluates to true
- Use `true` as the final condition to create a default/fall-through case

**✅ CORRECT - Using Boolean Conditions:**
```javascript
Case(
    success == true,
        // Handle success case
        $pallet_array_object = JSONParser(pallet_array_JSON);
        $totalPallets = $pallet_array_object["totalPallets"];
    ,
    validationObj["status"] == "INVALID_JSON",
        // Handle invalid JSON
        $isTest = true;
        $jitterbitErrorMessage += "Invalid JSON, ";
    ,
    validationObj["status"] == "MISSING_DATA",
        // Handle missing data
        $isTest = true;
        $jitterbitErrorMessage += "Missing data, ";
    ,
    true,
        // Default case
        $isTest = true;
        $jitterbitErrorMessage += "Validation failed, ";
);
```

**❌ WRONG - String Matching (Switch Statement Style):**
```javascript
// This is INCORRECT - Case doesn't work like a switch statement
Case(status,
    "VALID",
        // This won't work correctly
        $totalPallets = 10;
    ,
    "INVALID_JSON",
        // This won't work correctly
        $isTest = true;
);
```

**Example with Multiple Conditions:**
```javascript
Case(
    Field1 > 100, "High",
    Field1 >= 50 && Field1 <= 100, "Medium",
    Field1 > 0 && Field1 < 50, "Low",
    true, "Unknown"  // default case
)
```

**Assigning Case Result to a Variable:**
You can assign the result of a Case statement directly to a variable:

```javascript
// ✅ CORRECT - Assign Case result to variable
$result = Case(
    condition1, "1",
    condition2, "2",
    true, "0"  // default
);

// Example: Set status code based on validation
$statusCode = Case(
    success == true, "VALID",
    validationObj["status"] == "INVALID_JSON", "ERROR",
    validationObj["status"] == "MISSING_DATA", "WARNING",
    true, "UNKNOWN"
);
```

**When to Use Case vs If:**
- Use **If** for simple two-way logic: `If(condition, valueIfTrue, valueIfFalse)`
- Use **Case** when you have three or more branches or need a clear "default" result
- Use **Case** when you want to assign a value based on multiple conditions: `$variable = Case(...)`

---

## JSON Functions

Jitterbit provides built-in functions for working with JSON data. These are commonly used in mappings when processing JSON from custom fields or API responses.

### JSONParser
Converts a JSON string into a dictionary object that can be accessed with bracket notation.

**Syntax:**
```javascript
dictionary JSONParser(string json_string)
```

**Example:**
```javascript
// Parse JSON string to object
$pallet_array_object = JSONParser(pallet_array_JSON);

// Access nested data
$totalPallets = $pallet_array_object["totalPallets"];
$currentPallet = $pallet_array_object["pallets"][$palletIterator];
$sscc = $currentPallet["sscc"];
```

**Version Requirements:** Design Studio 11.29+, Agent 11.29+

### GetJSONString
Retrieves data from a JSON object string using a path expression.

**Syntax:**
```javascript
string GetJSONString(string json_string, string path)
```

**Example:**
```javascript
json_string = '{ "company": [{ "name": "Jitterbit", "product": [{ "type": "iPaaS", "name": "Jitterbit iPaaS" }] }] }';

GetJSONString(json_string, "/company/[0]/product/[0]/name");
// Returns "Jitterbit iPaaS"
```

**Version Requirements:** Design Studio 11.28+, Agent 11.28+

### JSONStringify
Converts a dictionary object into a JSON string.

**Syntax:**
```javascript
string JSONStringify(dictionary json_object)
```

**Example:**
```javascript
json_object = Dict();
json_object["name"] = "Jitterbit";
json_object["type"] = "iPaaS";

JSONStringify(json_object);
// Returns '{"name":"Jitterbit","type":"iPaaS"}'
```

**Version Requirements:** Design Studio 11.30+, Agent 11.30+ (11.45+ for full character support)

**Note:** For detailed JSON function documentation, see `JSON-Functions.md`.

---

## Notes

- Variables without `$` are local to the target node script
- Variables with `$` are global and persist across target nodes
- Source nodes are required for Jitterbit to know how many times to loop
- JSON parsing creates dictionary objects that can be accessed with bracket notation
- Always use `$` prefix when accessing JSON data that will be used in multiple nodes
- Case statements use boolean conditions, not string matching like switch statements
- Case statements can be assigned directly to variables: `$variable = Case(...)`

