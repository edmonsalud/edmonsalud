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

                        if (shipmethod_id == 3981 ){ // OLD DOMINION - ODFL

                        }

                        if (shipmethod_id == 5406 || shipmethod_id ==  2048 ){ // UPS Ground

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
                function afterSubmit(scriptContext) {

                    if (scriptContext.type == 'create') {


                        // testing repo

                        var so_id = scriptContext.newRecord.id



                        var so_rec = record.load({
                            type: 'salesorder',
                            id: so_id,
                            isDynamic: true
                        })

                        var so_tranid = so_rec.getValue({
                            fieldId: 'tranid'
                        })

                        var so_new_order_type = so_rec.getValue({
                            fieldId: 'custbody_nsts_order_type'
                        })

                        if (so_new_order_type == 5) {

                            var so_order_date = so_rec.getText({
                                fieldId: 'trandate'
                            })


                            var so_cust_name = so_rec.getText({
                                fieldId: 'entity'
                            })

                            var so_cust_id = so_rec.getValue({
                                fieldId: 'entity'
                            })

                            var so_address = so_rec.getText({
                                fieldId: 'shipaddress'
                            })

                            so_address = so_address.replace(/\n/g, ' ')

                            var addr_rec = so_rec.getSubrecord('shippingaddress')

                            var so_city = addr_rec.getValue('city')
                            var so_state = addr_rec.getValue('state')
                            var so_phone = addr_rec.getValue('addrphone')
                            var so_zip = addr_rec.getValue('zip')

                            var so_country = addr_rec.getValue('country')


                            var fieldLookUp = search.lookupFields({
                                type: search.Type.CUSTOMER,
                                id: so_cust_id,
                                columns: ['email']
                            });

                            so_rec.selectLine('item', 0)

                            var so_item_name = so_rec.getCurrentSublistText('item', 'item')
                            var so_item_qty = so_rec.getCurrentSublistValue('item', 'quantity')
                            var so_item_rate = so_rec.getCurrentSublistValue('item', 'rate')

                            var so_email = fieldLookUp.email





                            var rec = record.transform({
                                fromType: 'salesorder',
                                fromId: so_id,
                                toType: 'itemfulfillment',
                                isDynamic: true,
                            });


                            var rec_lc = rec.getLineCount({
                                sublistId: 'item'
                            })

                            rec.setValue('shipstatus', 'B')

                            for (x = 0; x < rec_lc; x++) {

                                rec.selectLine({
                                    sublistId: 'item',
                                    line: x
                                })

                                var itemtype = rec.getCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'itemtype'
                                })

                                var quantity = rec.getCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'quantity'
                                })

                                log.debug('itemtype', itemtype)

                                if (itemtype == 'Kit') {


                                    rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'itemreceive',
                                        value: true,
                                        //  ignoreFieldChange: true
                                    })

                                    rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'location',
                                        value: '1',
                                        //  ignoreFieldChange: true
                                    })

                                    rec.commitLine({
                                        sublistId: 'item'
                                    })
                                } else {
                                    rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'itemreceive',
                                        value: true,
                                        //    ignoreFieldChange: true
                                    })

                                    var quantity = rec.getCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity'
                                    })

                                    log.debug('quantity2', quantity)

                                    rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'location',
                                        value: '1',
                                        // ignoreFieldChange: true
                                    })

                                    var subrec = rec.getCurrentSublistSubrecord({
                                        sublistId: 'item',
                                        fieldId: 'inventorydetail'
                                    });

                                    if (subrec) {

                                        subrec.selectNewLine({
                                            sublistId: 'inventoryassignment'
                                        });
                                        // Update quantity for subrecord. Note quantity total must equal quantity in item line

                                        log.debug('subrec')
                                        subrec.setCurrentSublistValue({
                                            sublistId: 'inventoryassignment',
                                            fieldId: 'quantity',
                                            value: quantity
                                        });


                                        subrec.setCurrentSublistValue({
                                            sublistId: 'inventoryassignment',
                                            fieldId: 'issueinventorynumber',
                                            value: 'Good'
                                        });
                                        subrec.commit();
                                    }
                                    rec.commitLine({
                                        sublistId: 'item'
                                    })

                                }





                            }
                            var if_id = rec.save();


                            var if_rec = record.load({
                                type: 'itemfulfillment',
                                id: if_id,
                                isDynamic: true
                            })

                            var if_tranid = if_rec.getValue({
                                fieldId: 'tranid'
                            })

                            so_item_name = so_item_name.split('-')
                            so_item_name = so_item_name[0]
                            var csv_header = 'Fulfilment Number,SO NUMBER,Order Type ,Order Date,Shipping Type,Customer Name,Address,City,State,Phone Number,Email Address,Ship to Customer Name,Ship to Address,Ship to Zip,Ship to City,Ship to State,Ship to Phone,Delivery Item No.,Item Code,Quantity,Ship to country ,Unit price'
                            var csv_contents = if_tranid + ',' + so_tranid + ',' + so_new_order_type + ',' + so_order_date + ',' + so_new_order_type + ',' + so_cust_name + ',' + so_address + ',' + so_city + ',' + so_state + ',' + so_phone + ',' + so_email + ',' + so_cust_name + ',' + so_address + ',' + so_zip + ',' + so_city + ',' + so_state + ',' + so_phone + ',' + so_item_name + ',' + so_item_name + ',' + so_item_qty + ',' + so_country + ',' + so_item_rate
                            var csv = csv_header + '\n' + csv_contents

                            var fileObj = file.create({
                                name: '3pl_outbound_' + so_tranid + '.csv',
                                fileType: file.Type.CSV,
                                contents: csv,
                                encoding: file.Encoding.UTF8,
                                folder: 14233,
                                isOnline: true
                            });

                            fileObj.save();
                        }
                    }


                }

                return {
                    //      beforeLoad: beforeLoad,
                    //   beforeSubmit: beforeSubmit,
                    afterSubmit: afterSubmit
                };

            });