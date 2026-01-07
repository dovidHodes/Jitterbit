# JSON Functions in Jitterbit Design Studio

## Introduction

JavaScript Object Notation (JSON) functions allow for the manipulation of data in the JSON format. For more information on JSON, refer to IETF RFC 8259: The JavaScript Object Notation (JSON) Data Interchange Format.

## GetJSONString

### Declaration

```javascript
string GetJSONString(string json_string, string path)
```

### Syntax

```javascript
GetJSONString(<json_string>, <path>)
```

### Required Parameters

- **json_string**: A JSON object string to parse data from.
- **path**: A valid path representing the location of the data in the JSON object string.

### Description

Retrieves data from a JSON object string using the provided path.

### Important

This function requires Design Studio version 11.28 or later and agent version 11.28 or later.

### Examples

```javascript
// Define the JSON object string:
json_string = '{ "company": [{ "name": "Jitterbit", "product": [{ "type": "iPaaS", "name": "Jitterbit iPaaS" },{ "type": "EDI", "name": "Jitterbit EDI" }] }] }';

GetJSONString(json_string, "/company/[0]/product/[1]/name");
// Returns "Jitterbit EDI"

GetJSONString(json_string, "/company/[0]/product");
// Returns '[{"type":"iPaaS","name":"Jitterbit iPaaS"},{"type":"EDI","name":"Jitterbit EDI"}]'

GetJSONString(json_string, "/company/[0]/employees");
// Returns an "employees is not a valid path" error because companies do not have employees defined in the JSON object string

GetJSONString(json_string, "/company/[1]");
// Returns a "1 is out of range" error because only one company is defined in the JSON object string
```

---

## JSONParser

### Declaration

```javascript
dictionary JSONParser(string json_string)
```

### Syntax

```javascript
JSONParser(<json_string>)
```

### Required Parameters

- **json_string**: A JSON object string to convert into a JSON object.

### Description

Converts a JSON object string into a JSON object.

The maximum size of the JSON object string that can be passed to the JSONParser function at a given time depends on the project environment's agent hardware and workload.

### Important

This function requires Design Studio version 11.29 or later and agent version 11.29 or later.

### Examples

```javascript
// Define the JSON object string:
json_string = '{ "company": [{ "name": "Jitterbit", "product": [{ "type": "iPaaS", "name": "Jitterbit iPaaS" },{ "type": "EDI", "name": "Jitterbit EDI" }] }] }';

// Convert the JSON object string into a JSON object:
json_object = JSONParser(json_string);

result = json_object["company"][0]["product"][1]["name"];
// Equals "Jitterbit EDI"

result = json_object["company"][0]["product"];
// Equals {"[name=>""Jitterbit iPaaS"",type=>""iPaaS""]","[name=>""Jitterbit EDI"",type=>""EDI""]"}
```

---

## JSONStringify

### Declaration

```javascript
string JSONStringify(dictionary json_object)
```

### Syntax

```javascript
JSONStringify(<json_object>)
```

### Required Parameters

- **json_object**: A JSON object to convert into a JSON object string.

### Description

Converts a JSON object into a JSON object string.

### Important

This function requires Design Studio version 11.30 or later and agent version 11.30 or later. Support for reserved JSON characters such as " and \ and being able to handle null data requires agent version 11.45 or later.

### Example

```javascript
// Define the JSON object structure:
json_object = Dict();

json_object["company"][0] = Dict();
json_object["company"][0]["name"] = "Jitterbit";

json_object["company"][0]["product"][0] = Dict();
json_object["company"][0]["product"][0]["type"] = "iPaaS";
json_object["company"][0]["product"][0]["name"] = "Jitterbit iPaaS";
json_object["company"][0]["product"][0]["active"] = True;
json_object["company"][0]["product"][0]["internalID"] = 123;
json_object["company"][0]["product"][0]["description"] = 'Low-code integration solutions that deliver enterprise-grade performance.\nSecure, scalable, and AI-infused, Jitterbit iPaaS grows with your organization.\n"Request a free trial today!"';

json_object["company"][0]["product"][1] = Dict();
json_object["company"][0]["product"][1]["type"] = "EDI";
json_object["company"][0]["product"][1]["name"] = "Jitterbit EDI";
json_object["company"][0]["product"][1]["active"] = True;
json_object["company"][0]["product"][1]["internalID"] = 124;
json_object["company"][0]["product"][1]["description"] = null();

JSONStringify(json_object);
// Returns '{"company":[{"name":"Jitterbit", "product":[{"name":"Jitterbit iPaaS", "type":"iPaaS", "active":1, "internalID":123, "description":"Low-code integration solutions that deliver enterprise-grade performance.\\nSecure, scalable, and AI-infused, Jitterbit iPaaS grows with your organization.\\n\\"Request a free trial today!\\""},
            {"name":"Jitterbit EDI", "type":"EDI", "active":1, "internalID":124, "description":null}]}]}'
```

---

## Version Requirements Summary

| Function | Design Studio | Agent |
|----------|---------------|-------|
| GetJSONString | 11.28+ | 11.28+ |
| JSONParser | 11.29+ | 11.29+ |
| JSONStringify | 11.30+ | 11.30+ (11.45+ for full character support) |

