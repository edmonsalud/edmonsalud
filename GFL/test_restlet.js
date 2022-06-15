/**
 * @NApiVersion 2.x
 * @NScriptType restlet
 */
define(['N/record'], function (record) {
    return {
        post: function (restletBody) {
            var restletData = restletBody.data;


            log.debug(restletData);

        }
     }
});