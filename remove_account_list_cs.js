/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/search'],

    function (log, search) {

        function pageInit(scriptContext) {
            var currentRec = scriptContext.currentRecord;
            var currentRec = scriptContext.currentRecord;
            var subsidiary = currentRec.getValue({
                fieldId: 'subsidiary'
            });
            if (subsidiary == '') {
                return true;
            }
            log.debug('pageInit', 'subsidiary = ' + subsidiary);
            var adjAccountField = currentRec.getField({
                fieldId: 'custpage_adjustmentaccount'
                //fieldId: 'custbody_adjustmentaccountcus'
            });

            var accountSearch = search.create({
                type: 'account',
                columns: [{
                    name: 'internalid'
                }, {
                    name: 'displayname'
                }],
                filters: [{
                    name: 'type',
                    operator: 'anyof',
                    values: ["COGS"]
                }, {
                    name: 'subsidiary',
                    operator: 'anyof',
                    values: [subsidiary]
                }]
            });

            var searchResult = accountSearch.run().each(function (result) {
                var accountId = result.getValue({
                    name: 'internalid'
                });

                var accountDisplayName = result.getValue({
                    name: 'displayname'
                });

                adjAccountField.insertSelectOption({
                    value: accountId,
                    text: accountDisplayName
                });

                return true;
            });

        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {

            // 211 - 00000
            // 228 : 4 - 1020
            // 225 - 1068

            // class 132 - audio solutions
            //codec 137


            // account  511 40030 Technology Licensing Revenue (TENTATIVE)

            // 527 50001 Allocation - COR (TENTATIVE)

            var corporate = [696, 261, 262, '696', '261', '262']
            var audio = [533, '533']
            var audio_proc = [534, '534']

            /// class variables 


            var corporate_accounts = '11000 Test AR \n 11001 A/R - Trade \n 11002 A/R - Trade - Consumer '
            var audio_accounts = '60001 Salaries'
            var audio_proc_accounts = '60002 Contingent Workforce'
            var exemption_list = [261, 262, 300, 303, 304, 306, 308, 309, 313, 314, 315, 316, 317, 318, 348]

            if (scriptContext.sublistId == 'line' && (scriptContext.fieldId == 'account' || scriptContext.fieldId == 'department' || scriptContext.fieldId == 'class')) {

                log.debug('triggered')

                var currentRec = scriptContext.currentRecord;

                var account = currentRec.getCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account'
                })

                var account_text = currentRec.getCurrentSublistText({
                    sublistId: 'line',
                    fieldId: 'account'
                })

                var department = currentRec.getCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department'
                })
                var department_txt = currentRec.getCurrentSublistText({
                    sublistId: 'line',
                    fieldId: 'department'
                })

                var class_item = currentRec.getCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class'
                })
                var class_item_text = currentRec.getCurrentSublistText({
                    sublistId: 'line',
                    fieldId: 'class'
                })

                log.debug('department', department)
                log.debug('account', account)
                log.debug('department_txt', department_txt)
                log.debug('department_txt', account_text)


                if ((account_text.indexOf('6') != 0 && account != '' ) && (department != 211 && department != '')) {
                    alert('Accounts that do not start with 6XXXX should only have department 0000 - Corporate')
                    currentRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'department',
                        value: '',
                        ignoreFieldChange: true,
                        forceSyncSourcing: true
                    })
                }

                if (account == 511 && class_item != 132) {

                    alert('Account ' + account_text + ' can only be used on class "Audio solutions"')
                    currentRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: '',
                        ignoreFieldChange: true,
                        forceSyncSourcing: true
                    })
                } else if (account == 527 && class_item != 137) {

                    alert('Account ' + account_text + ' can only be used on class "Codec"')
                    currentRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: '',
                        ignoreFieldChange: true,
                        forceSyncSourcing: true
                    })

                } else if ((account != '' && department != '')) {

                    switch (department) {
                        case 211:
                        case '211':
                            if (corporate.indexOf(account) == -1) {
                                printAlert(corporate_accounts, department_txt)
                                currentRec.setCurrentSublistValue({
                                    sublistId: 'line',
                                    fieldId: 'account',
                                    value: '',
                                    ignoreFieldChange: true,
                                    forceSyncSourcing: true
                                })

                            }

                            break;

                        case 228:
                        case 4:
                        case '228':
                        case '4':
                            if (audio.indexOf(account) == -1) {
                                printAlert(audio_accounts, department_txt)
                                currentRec.setCurrentSublistValue({
                                    sublistId: 'line',
                                    fieldId: 'account',
                                    value: '',
                                    ignoreFieldChange: true,
                                    forceSyncSourcing: true
                                })
                            }

                            break;
                        case 225:
                        case '225':
                            if (audio_proc.indexOf(account) == -1) {
                                printAlert(audio_proc_accounts, department_txt)
                                currentRec.setCurrentSublistValue({
                                    sublistId: 'line',
                                    fieldId: 'account',
                                    value: '',
                                    ignoreFieldChange: true,
                                    forceSyncSourcing: true
                                })
                            }
                            break;



                    }
                }


                if (exemption_list.indexOf(parseInt(account)) != -1) {
                    alert('No Journal Entry transaction is allowed for account  ' + account_text + ' .')
                    currentRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: '',
                        ignoreFieldChange: true,
                        forceSyncSourcing: true
                    })
                }

            }



        }

        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(scriptContext) {





        }

        function printAlert(allow_accounts, department_txt) {

            var text = "You are not allowed to select this account for department "
            text = text + department_txt + '\n' + 'Please choose from one of the following accounts for this departments \n'
            text = text + allow_accounts

            alert(text)
            return true
        }

        return {
            //       pageInit: pageInit,
            fieldChanged: fieldChanged,
            //        postSourcing: postSourcing

        };

    });