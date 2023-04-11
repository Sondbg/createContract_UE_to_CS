/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/ui/dialog'],
    /**
 * @param{log} log
 * @param{dialog} dialog
 */
    (log, dialog) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {

            try {

                var currRecord = scriptContext.newRecord;
                var triggerType = scriptContext.type;

                if (triggerType != "view") return;

                var internalStatus = currRecord.getValue({
                    fieldId: "custbody_aqt_internal_status"
                });

                if (internalStatus != "4") return;

                var job= currRecord.getValue({
                    fieldId: "job"
                });

                if(!job) return;

                var invoiceCreated=currRecord.getValue({
                    fieldId: "custbody_aqt_source"
                });

               if(invoiceCreated) return

                var form = scriptContext.form;
                
                form.clientScriptModulePath = './createContractFromEstimate.js';

                form.addButton({
                    id: "custpage_create_contract",
                    label: "Създай Договор",
                    functionName: `createContractInvoice(${currRecord.id})`
                });



            } catch (e) {
                log.error({
                    title: "could not add Button",
                    details: e
                })
            }


        }


        return { beforeLoad }

    });
