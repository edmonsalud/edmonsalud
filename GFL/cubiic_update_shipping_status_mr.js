    /**
     * @NApiVersion 2.1
     * @NScriptType MapReduceScript
     */
     define(['N/record', 'N/search', 'N/render', 'N/email', 'N/file', 'N/runtime', 'N/url','N/https'],
     function (record, search, render, email, file, runtime, url, https) {



         function getCustRecords(context) {
             var soSearch = search.load({
                 id: 'customsearch_update_carrier_status' // change this based on the created saved search
             });

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
                 'id': '',
                 'tracking_num': ''
             }


             invObj.id = searchResult.id
             invObj.tracking_num = searchResult.values['trackingnumbers']


             context.write({
                 key: invObj,
                 value: 1
             })




         }


         function gatherInfo(context) {

             try {


                 log.debug("reduce", context.key)
                 var reduceObj = JSON.parse(context.key)


                 var search_int_id = reduceObj.id 
                 var search_tracking_num = reduceObj.tracking_num


                 update_tracking(search_tracking_num,search_int_id)

             } catch (e) {
                 log.debug('e', e)
             }
         }


         function summarize(context) {




         }





         function update_tracking(track_num, rec_id) {
             var tracking_num = track_num

             var rec_id = rec_id

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
             log.debug('response1', response)+
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

             response = JSON.parse(response.body)             log.debug('response1', response)

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

             log.debug('cubiic_status', cubiic_status)

             record.submitFields({
                 type: 'itemfulfillment',
                 id: rec_id,
                 values: {
                     'custbody_cubiic_shipping_status': cubiic_status
                 },
                 options: {
                     enablesourcing: false

                 }
             })

         };









         return {
             getInputData: getCustRecords,
             map: map,
             reduce: gatherInfo,
             summarize: summarize,
         }
     });