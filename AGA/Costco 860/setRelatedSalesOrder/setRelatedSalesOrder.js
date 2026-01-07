/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

define(['N/record', 'N/log', 'N/search'], function(record, log, search) {
    
    /**
     * Function to be executed after record submit.
     * Searches for a sales order matching PO number and entity, then populates related transaction field.
     */
    function afterSubmit(context) {
        try {
    
            
            log.debug('Set Related Sales Order', 'Processing custom transaction: ' + context.newRecord.id);
            
            // Get the PO number from custbody_sps_cx_ponumber
            var poNumber = context.newRecord.getValue('custbody_sps_cx_ponumber');
            
            if (!poNumber) {
                log.debug('No PO Number', 'custbody_sps_cx_ponumber is empty, skipping processing');
                return;
            }
            
            log.debug('PO Number Found', 'PO Number: ' + poNumber);
            
            // Get the entity ID from custbody_po_change_customer_id
            var entityId = context.newRecord.getValue('custbody_po_change_customer_id');
            
            if (!entityId) {
                log.debug('No Entity ID', 'custbody_po_change_customer_id is empty, skipping processing');
                return;
            }
            
            log.debug('Entity ID Found', 'Entity ID: ' + entityId);
            
            // Search for sales order matching PO number and entity
            // Check externalid or otherrefnum
            var salesOrderSearch = search.create({
                type: search.Type.SALES_ORDER,
                filters: [
                    ['entity', 'anyof', entityId],
                    'AND',
                    [
                        ['externalid', 'is', poNumber],
                        'OR',
                        ['otherrefnum', 'is', poNumber]
                    ]
                ],
                columns: [
                    search.createColumn({ name: 'internalid' }),
                    search.createColumn({ name: 'externalid' }),
                    search.createColumn({ name: 'otherrefnum' })
                ]
            });
            
            // Run the search and get all results
            var searchResults = salesOrderSearch.run().getRange({
                start: 0,
                end: 1000
            });
            
            log.debug('Search Results Count', 'Found ' + searchResults.length + ' sales order(s)');
            
            // Loop through all results to find the first one that matches
            var matchedSalesOrderId = null;
            
            for (var i = 0; i < searchResults.length; i++) {
                var result = searchResults[i];
                var salesOrderId = result.id;
                var foundExternalId = result.getValue('externalid');
                var foundOtherRefNum = result.getValue('otherrefnum');
                
                log.debug('Checking Sales Order', 'Sales Order ID: ' + salesOrderId + 
                    ', externalid: ' + foundExternalId + 
                    ', otherrefnum: ' + foundOtherRefNum);
                
                // Check if at least one of the fields actually matches
                if ((foundExternalId && foundExternalId === poNumber) ||
                    (foundOtherRefNum && foundOtherRefNum === poNumber)) {
                    matchedSalesOrderId = salesOrderId;
                    log.debug('Match Found', 'Sales Order ID: ' + salesOrderId + ' matches PO Number: ' + poNumber);
                    break; // Use the first match
                }
            }
            
            if (matchedSalesOrderId) {
                // Update the related transaction field using submitFields
                record.submitFields({
                    type: context.newRecord.type,
                    id: context.newRecord.id,
                    values: {
                        custbody_sps_cx_related_trxn: matchedSalesOrderId
                    }
                });
                
                log.debug('Related Transaction Set', 'Sales Order ID: ' + matchedSalesOrderId + ' set on record: ' + context.newRecord.id);
            } else {
                log.debug('No Matching Sales Order Found', 'No sales order found with matching PO Number: ' + poNumber + ' and Entity ID: ' + entityId + '. Field left blank.');
            }
            
        } catch (e) {
            log.error('Error in afterSubmit', 'Error: ' + e.message + '\nStack: ' + e.stack);
        }
    }
    
    return {
        afterSubmit: afterSubmit
    };
});

