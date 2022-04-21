/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @Eric Gil
 */
define(['N/record', 'N/file', 'N/search'],

    function (record, file, search) {

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        function beforeLoad(scriptContext) {

        }

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function beforeSubmit(scriptContext) {

            if (scriptContext.type == 'create' || scriptContext.type == 'create') {
                var rec = scriptContext.newRecord
                var cust_id = rec.getValue({
                    fieldId: entity
                })
                var label
                if (cust_id == 339923) {

                    var shipmethod_id = rec.getValue({
                        fieldId: 'shipmethod'
                    })

                    if (shipmethod_id == 3981) { // OLD DOMINION - ODFL
                        label = 6 //Ace Hardware Shipping Label Pallet
                    }

                    if (shipmethod_id == 5406 || shipmethod_id == 2048) { // UPS Ground
                        label = 1 // Ace Hardware Shipping Label
                    }


                    if (label != undefined) {
                        rec.setValue({
                            fieldId: 'custbody_sps_customer_label',
                            value: label
                        })
                    }


                }
            }
        }

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function afterSubmit(scriptContext) {}

        return {
            //      beforeLoad: beforeLoad,
            //   beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });