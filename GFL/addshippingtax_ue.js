/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
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

            if (scriptContext.type == 'create') {

                var rec = scriptContext.newRecord

                var far_app_str = rec.getValue({
                    fieldId: 'custbody_farapp_storefront'
                })

                var shipping_cost = rec.getValue({
                    fieldId: 'shippingcost'
                })

                if (shipping_cost > 0 && far_app_str == 'Amazon') {
                    shipping_cost = shippingcost / 1.1
                }


                rec.setValue({
                    fieldId: 'shippingcost',
                    value: shipping_cost
                })

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
        function afterSubmit(scriptContext) {


            if (scriptContext.type == 'create') {}





        }

        return {
            //     beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });