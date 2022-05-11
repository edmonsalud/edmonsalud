/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
 define(['N/ui/serverWidget', 'N/ui/message', 'N/record', 'N/url', 'N/email'], function (serverWidget, message, record, url, email) {
    function onRequest(context) {

        var form = serverWidget.createForm({
            title: 'Send Email via Support Case'
        });
        form.addField({
            id: 'custom_customer',
            label: 'Customer',
            type: serverWidget.FieldType.SELECT,
            source: record.Type.CUSTOMER
        });
        form.addField({
            id: 'custom_email',
            label: 'Email Address (not required)',
            type: serverWidget.FieldType.TEXT
        });
        form.addField({
            id: 'custom_messagesubject',
            label: 'Message Subject',
            type: serverWidget.FieldType.TEXT
        });
        form.addField({
            id: 'custom_messagebody',
            label: 'Message Body',
            type: serverWidget.FieldType.RICHTEXT
        });
        form.addSubmitButton({
            label: 'Send Email'
        });

        if (context.request.method === 'POST') {
            var customerId = context.request.parameters['custom_customer'];
            var customerEmail = context.request.parameters['custom_email'];
            var messageSubject = context.request.parameters['custom_messagesubject'];
            var messageBody = context.request.parameters['custom_messagebody'];

            try {
                var caseId = 0;
                var errorMsg = '';

                var caseRec = record.create({
                    type: record.Type.SUPPORT_CASE
                });
                caseRec.setValue({
                    fieldId: 'company',
                    value: customerId
                });
                // You can specify an email address to overide the customer's default
                // Useful if you need to use an "Anonymous Customer" record and set the outgoing email address to the correct one
                if (customerEmail != '') {
                    caseRec.setValue({
                        fieldId: 'email',
                        value: customerEmail
                    });
                }
                caseRec.setValue({
                    fieldId: 'title',
                    value: messageSubject
                });
                caseRec.setValue({
                    fieldId: 'emailform',
                    value: true
                });
                caseRec.setValue({
                    fieldId: 'outgoingmessage',
                    value: messageBody
                });
                caseId = caseRec.save({
                    ignoreMandatoryFields: true
                });

            } catch (e) {
                errorMsg = JSON.stringify(e);
            }

            if (caseId > 0 && errorMsg == '') {
                var caseUrl = url.resolveRecord({
                    recordType: record.Type.SUPPORT_CASE,
                    recordId: caseId
                });
                form.addPageInitMessage({
                    message: 'Email sent successfully. <a target="_blank" href="' + caseUrl + '">Open Support Case</a>',
                    title: "Success!",
                    type: message.Type.CONFIRMATION
                });
            } else {
                form.addPageInitMessage({
                    message: "Error occurred while sending case message: " + errorMsg,
                    title: "Failed",
                    type: message.Type.ERROR
                });
            }

        }

        context.response.writePage(form);
    }
    return {
        onRequest: onRequest
    };
});