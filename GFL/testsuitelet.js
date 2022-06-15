/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/ui/message', 'N/record', 'N/url', 'N/email', 'N/https'], function (serverWidget, message, record, url, email, https) {
    function onRequest(context) {


        var body_1 = {
            "email": 'api@gflgroup.cubiic.com.au',
            "password": 'RJQ3A36I',
            "wmsCode": 'GFLGROUP'
        }
        var base_url = 'https://cubiicpublic.azurewebsites.net/'

        var headers_1 = {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',

        }


        var response = https.post({

            url: base_url + 'TokenByWmsCode',
            headers: headers_1,
            body: body_1,
          
        })

        log.debug('response1',response)

        log.debug('response', JSON.stringify(response))


    }
    return {
        onRequest: onRequest
    };
});