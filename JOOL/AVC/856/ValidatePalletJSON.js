/**
 * ValidatePalletJSON.js
 * 
 * Validates pallet JSON data with proper error handling
 * 
 * Input: JSON string passed via global variable $palletJSONString (set in mapping)
 * Output: Returns JSON object via SetScriptResult():
 *   {
 *     "status": "VALID" | "INVALID_JSON" | "MISSING_DATA",
 *     "success": true | false,
 *     "errorMessage": "error details" (only if success is false)
 *   }
 */

// Get input JSON string from global variable (set in mapping using $palletJSONString = value)
// In JavaScript, access global variables using Jitterbit.GetVar() with $ prefix in the name
// Or use $variableName directly - both work in JavaScript
var jsonString = Jitterbit.GetVar("$palletJSONString");
var result = {};

WriteToOperationLog("ValidatePalletJSON script called");
WriteToOperationLog("JSON String length: " + (jsonString ? jsonString.length : "null"));

// Declare variables
var jsonValid = true;
var pallet_array_object = null;

// Check if JSON string is empty, null, or the literal string "null"
if (!jsonString || jsonString === "" || jsonString === "{}" || jsonString === "null") {
    result = {
        "status": "MISSING_DATA",
        "success": false,
        "errorMessage": "Pallet_array_JSON field is empty or missing"
    };
    WriteToOperationLog("ERROR: " + result.errorMessage);
    jsonValid = false;
}

// Try to parse JSON with try-catch (only if jsonString is valid)
if (jsonValid) {
    try {
        // Use JSON.parse for JavaScript (instead of JSONParser function)
        pallet_array_object = JSON.parse(jsonString);
        WriteToOperationLog("JSON parsed successfully");
    } catch (e) {
        // JSON parsing failed - malformed JSON
        result = {
            "status": "INVALID_JSON",
            "success": false,
            "errorMessage": "Pallet_array_JSON is malformed or invalid JSON: " + e.message
        };
        WriteToOperationLog("ERROR: " + result.errorMessage);
        jsonValid = false;
        pallet_array_object = null;
    }
}

// JSON parsed successfully, validate required fields (only if JSON is valid)
var validationErrors = [];

if (jsonValid) {
    // Validate totalPallets field
    var totalPallets = pallet_array_object["totalPallets"];
    if (totalPallets === null || totalPallets === undefined || totalPallets === "") {
        validationErrors.push("Missing totalPallets field in JSON");
    }

    // Validate pallets array exists
    var palletsArray = pallet_array_object["pallets"];
    if (!palletsArray || !Array.isArray(palletsArray) || palletsArray.length === 0) {
        validationErrors.push("Missing or empty pallets array in JSON");
    } else {
        // Validate each pallet has required fields
        for (var i = 0; i < palletsArray.length; i++) {
            var pallet = palletsArray[i];
            var palletNum = i + 1;
            
            // Check required pallet fields
            if (pallet["palletNumber"] === null || pallet["palletNumber"] === undefined) {
                validationErrors.push("Pallet " + palletNum + " missing palletNumber");
            }
            
            if (!pallet["sscc"] || pallet["sscc"] === "") {
                validationErrors.push("Pallet " + palletNum + " missing or empty sscc");
            }
            
            // Validate items array
            var itemsArray = pallet["items"];
            if (!itemsArray || !Array.isArray(itemsArray) || itemsArray.length === 0) {
                validationErrors.push("Pallet " + palletNum + " missing or empty items array");
            } else {
                // Validate each item has required fields
                for (var j = 0; j < itemsArray.length; j++) {
                    var item = itemsArray[j];
                    var itemNum = j + 1;
                    
                    if (item["qty"] === null || item["qty"] === undefined || item["qty"] === "") {
                        validationErrors.push("Pallet " + palletNum + " Item " + itemNum + " missing or empty qty");
                    }
                    
                    if (!item["vpn"] || item["vpn"] === "") {
                        validationErrors.push("Pallet " + palletNum + " Item " + itemNum + " missing or empty vpn");
                    }
                    
                    if (!item["ediUom"] || item["ediUom"] === "") {
                        validationErrors.push("Pallet " + palletNum + " Item " + itemNum + " missing or empty ediUom");
                    }
                    
                    if (!item["poLineNumber"] || item["poLineNumber"] === "") {
                        validationErrors.push("Pallet " + palletNum + " Item " + itemNum + " missing or empty poLineNumber");
                    }
                }
            }
        }
    }
}

// Determine final status
if (!jsonValid) {
    // Result already set in error handling above
} else if (validationErrors.length > 0) {
    result = {
        "status": "MISSING_DATA",
        "success": false,
        "errorMessage": validationErrors.join(", ")
    };
    WriteToOperationLog("VALIDATION ERRORS: " + result.errorMessage);
} else {
    result = {
        "status": "VALID",
        "success": true,
        "errorMessage": ""
    };
    WriteToOperationLog("JSON validation passed - all required fields present");
}

SetScriptResult(JSON.stringify(result));

