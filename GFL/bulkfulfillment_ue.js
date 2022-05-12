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

            if (scriptContext.type == 'create' || scriptContext.type == 'edit') {
                var new_rec = scriptContext.newRecord

                var new_ship_via = new_rec.getValue({
                    fieldId: 'custbody_ship_via_test'
                })

                var ship_via = new_rec.getValue({
                    fieldId: 'shipmethod'
                })

                log.debug('new_ship_via', new_ship_via)

                log.debug('ship_via', ship_via)

                if (ship_via != new_ship_via) {
                    new_rec.setValue({
                        fieldId: 'custbody_ship_via_test',
                        value: ship_via

                    })
                }


            }


            if (scriptContext.type == 'xedit') {
                var old_rec = scriptContext.oldRecord
                var new_rec = scriptContext.newRecord

                var old_ship_via = old_rec.getValue({
                    fieldId: 'custbody_ship_via_test'
                })

                var new_ship_via = new_rec.getValue({
                    fieldId: 'custbody_ship_via_test'
                })


                log.debug('old_ship_via', old_ship_via)
                log.debug('new_ship_via', new_ship_via)

                new_rec.setValue({
                    fieldId: 'shipmethod',
                    value: 'new_ship_via'

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




        }

        return {
            //     beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });