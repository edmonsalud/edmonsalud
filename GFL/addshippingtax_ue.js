/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/ui/message', 'N/record', 'N/url', 'N/email', 'N/https'], function (serverWidget, message, record, url, email, https) {
    function onRequest(context) {

        var tracking_num = 'TMSNEW000000352'

        var rec_id = '25339188'

        var body_1 = JSON.stringify({
            'email': 'api@gflgroup.cubiic.com.au',
            'password': 'RJQ3A36I',
            'wmsCode': 'GFLGROUP'
        })
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

        response = JSON.parse(response.body)
        log.debug('response1', response)
        var access_token = response.access_token
        log.debug('response', access_token)

        var headers_1 = {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Authorization': access_token,
        }

        var response = https.get({
            url: base_url + '/Consignment/GetEventsByConsignmentNo/' + tracking_num,
            headers: headers_1
        })

        log.debug('response', JSON.stringify(response))

        response = JSON.parse(response.body)
        log.debug('response1', response)

        var status = response.events[0].status


        log.debug('status', status)
        var cubiic_status


        switch (status) {
            case 'Despatched':

                cubiic_status = 1

                break;

            case 'In Transit':

                cubiic_status = 2

                break;

            case 'On Board':

                cubiic_status = 3

                break;

            case 'Delivered':

                cubiic_status = 4

                break;

            case 'Cancelled':

                cubiic_status = 5

                break;

            default:
                cubiic_status = 6
        }

        log.debug('cubiic_status',cubiic_status)



    }
    return {
        onRequest: onRequest
    };
});