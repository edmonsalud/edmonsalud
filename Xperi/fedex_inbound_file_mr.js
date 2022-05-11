    /**
     * @NApiVersion 2.1
     * @NScriptType MapReduceScript
     */
    define(['N/record', 'N/search', 'N/render', 'N/email', 'N/file', 'N/runtime', 'N/url'],
        function (record, search, render, email, file, runtime, url) {



            function getCustRecords(context) {
                var soSearch = search.load({
                    id: 'customsearch_fedex_inbound' // change this based on the created saved search
                });
//test
                var soResult = [];
                var count = 0;

                var pageSize = 1000;
                var start = 0;
                do {
                    var soResultSet = soSearch.run().getRange({
                        start: start,
                        end: start + pageSize
                    });

                    soResult = soResult.concat(soResultSet);
                    count = soResultSet.length;
                    start += pageSize;

                } while (count == pageSize);

                return soResult
            }




            function map(context) {

                var searchResult = JSON.parse(context.value)
                log.debug({
                    title: 'MAP JSON',
                    details: searchResult
                })


                var invObj = {
                    "id": "",
                    "filename": ""
                }


                invObj.id = searchResult.values['file.internalid'][0].value
                invObj.filename = searchResult.values['file.name']


                context.write({
                    key: invObj,
                    value: 1
                })




            }


            function gatherInfo(context) {

                try {
                    var email_param = runtime.getCurrentScript();
                    var email_param = email_param.getParameter({
                        name: 'custscript_email_notification'
                    });
                    log.error('email', email_param)

                    log.debug("reduce", context.key)
                    var reduceObj = JSON.parse(context.key)
                    var fileId = reduceObj.id

                    var parsedValues = []

                    log.debug('reduceObj', reduceObj.id)
                    var arrLines = file.load({
                        id: reduceObj.id
                    }).getContents().split(/\n|\n\r/);;

                    log.debug('arrLines.length', arrLines.length)

                    for (var i = 1; i < arrLines.length - 1; i++) {



                        var content = csvToArray(arrLines[i])


                        var fields = {
                            fld_if_num: '',
                            fld_delivery: '',
                            fld_item_num: '',
                            fld_serial_num: '',
                            fld_tsn: '',
                            fld_tracking_num: '',
                            fld_cust_sales_price: '',
                            fld_pallet_id: ''
                        }

                        var col_if_num = content[0][0]
                        var col_delivery = content[0][22]
                        var col_item_num = content[0][23]
                        var col_serial_num = content[0][24]
                        var col_tsn = content[0][25]
                        var col_tracking_num = content[0][26]
                        var col_cust_sales_price = content[0][27]
                        var col_pallet_id = content[0][31]



                        fields.fld_if_num = col_if_num
                        fields.fld_delivery = col_delivery
                        fields.fld_item_num = col_item_num
                        fields.fld_serial_num = col_serial_num
                        fields.fld_tsn = col_tsn
                        fields.fld_tracking_num = col_tracking_num
                        fields.fld_cust_sales_price = col_cust_sales_price
                        fields.fld_pallet_id = col_pallet_id

                        parsedValues.push(fields)
                    }
                    log.debug('pasrse', parsedValues)

                    var if_int_id = getIfId(parsedValues[0].fld_if_num)

                    log.debug('if_int_id', if_int_id)



                    var rec = record.load({
                        type: 'itemfulfillment',
                        id: if_int_id,
                        isDynamic: true
                    })

                    rec.setValue('shipstatus', 'B')

                    rec.selectLine({
                        sublistId: 'item',
                        line: 0
                    })

                    rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_xperi_if_tns_num',
                        value: parsedValues[0].fld_tsn
                    })

                    rec.commitLine({
                        sublistId: 'item'
                    })


                    rec.selectLine({
                        sublistId: 'package',
                        line: 0
                    })

                    rec.setCurrentSublistValue({
                        sublistId: 'package',
                        fieldId: 'packagetrackingnumber',
                        value: parsedValues[0].fld_tracking_num
                    })

                    rec.commitLine({
                        sublistId: 'package'
                    })

                    rec.selectLine({
                        sublistId: 'item',
                        line: 1
                    })

                    var item_check = rec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'itemname'
                    })

                    log.error('item_check', item_check)


                    if (item_check == parsedValues[0].fld_item_num) {
                        rec.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        })



                        fileObj = file.copy({
                            id: parseInt(reduceObj.id),
                            folder: 14234
                        });

                        fileObj.save();

                        file.delete({
                            id: reduceObj.id
                        });


                    } else {
                        email.send({
                            author: 3,
                            recipients: email_param,
                            subject: 'FedEx Inbound File Failure',
                            body: 'Inbound file does not match Netsuite record. Please check ' + parsedValues[0].fld_if_num,

                        });


                        fileObj = file.copy({
                            id: parseInt(reduceObj.id),
                            folder: 14237
                        });

                        fileObj.save();

                        file.delete({
                            id: reduceObj.id
                        });

                    }

                } catch (e) {
                    log.debug('e', e)
                }
            }


            function summarize(context) {




            }





            function csvToArray(text) {
                let p = '',
                    row = [''],
                    ret = [row],
                    i = 0,
                    r = 0,
                    s = !0,
                    l;
                for (l of text) {
                    if ('"' === l) {
                        if (s && l === p) row[i] += l;
                        s = !s;
                    } else if (',' === l && s) l = row[++i] = '';
                    else if ('\n' === l && s) {
                        if ('\r' === p) row[i] = row[i].slice(0, -1);
                        row = ret[++r] = [l = ''];
                        i = 0;
                    } else row[i] += l;
                    p = l;
                }
                return ret;
            };



            function getIfId(if_id) {
                var itemfulfillmentSearchColInternalId = search.createColumn({
                    name: 'internalid'
                });
                var itemfulfillmentSearch = search.create({
                    type: 'itemfulfillment',
                    filters: [
                        ['type', 'anyof', 'ItemShip'],
                        'AND',
                        ['numbertext', 'is', if_id],
                        'AND',
                        ['mainline', 'is', 'T'],
                    ],
                    columns: [
                        itemfulfillmentSearchColInternalId,
                    ],
                });
                // Note: Search.run() is limited to 4,000 results
                // itemfulfillmentSearch.run().each((result: search.Result): boolean => {
                //   return true;
                // });


                var internal_id
                itemfulfillmentSearch.run().each(function (result) {
                    internal_id = result.getValue(itemfulfillmentSearchColInternalId);
                    return true;
                });

                return internal_id

            }





            return {
                getInputData: getCustRecords,
                map: map,
                reduce: gatherInfo,
                summarize: summarize,
            }
        });