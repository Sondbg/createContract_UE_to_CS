/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/ui/dialog', 'N/url', 'N/record', 'N/search', 'N/runtime'],
    /**
     * @param{log} log
     * @param{dialog} dialog
     * @param{url} url
     */
    function (log, dialog, url, record, search, runtime) {

        function createContractInvoice(tranID) {

            try {


                var currRecord = record.load({
                    type: 'estimate',
                    id: tranID,
                    isDynamic: true,
                });

                var items = currRecord.getValue({
                    fieldId: "custbody_aqt_total_material_dynamic"
                });

                var labor = currRecord.getValue({
                    fieldId: "custbody_total_labourcost_dynamic"
                });

                var laborLining = currRecord.getValue({
                    fieldId: "custbody_aqt_total_labourcost_oblicovk"
                });

                var transport = currRecord.getValue({
                    fieldId: "custbody_aqt_total_transport_new"
                });

                var job = currRecord.getValue({
                    fieldId: "job"
                });

                var invoice = record.transform({
                    fromType: "estimate",
                    fromId: tranID,
                    toType: 'invoice',
                    isDynamic: true
                });

                var currUser = runtime.getCurrentUser();
                setFieldValue(invoice, "customform", "205");
                setFieldValue(invoice, "location", "118");
                setFieldValue(invoice, "memo", "Създадено от процес");
                setFieldValue(invoice, "custbody_aqt_payment_method", "2");
                setFieldValue(invoice, "custbody_aqt_created_by", currUser.id)
                setFieldValue(invoice, "discountitem", "");

                var projectNum

                if (job) {
                    projectNum = search.lookupFields({
                        type: "job",
                        id: job,
                        columns: "entityid"
                    });


                } else {
                    projectNum.entityid = ""
                }

                setFieldValue(invoice, "tranid", `Договор ${projectNum.entityid}`);

                var linesCount = invoice.getLineCount({
                    sublistId: "item"
                });

                for (var line = 0; line < linesCount;) {
                    invoice.removeLine({
                        sublistId: "item",
                        line: line,
                        ignoreRecalc: true
                    });
                    linesCount = invoice.getLineCount({
                        sublistId: "item"
                    });
                }

                if (items) {
                    setSublistValue(invoice, "item", "9156", items);
                }
                if (labor) {
                    setSublistValue(invoice, "item", "9157", labor);
                }
                if (transport) {
                    setSublistValue(invoice, "item", "9158", transport);
                }
                if (laborLining) {
                    setSublistValue(invoice, "item", "9890", laborLining);
                }

                invoice.save.promise().then((invoiceID) => {

                    var redirectURL = url.resolveRecord({
                        isEditMode: false,
                        recordId: invoiceID,
                        recordType: "invoice",

                    })
                    currRecord = record.load({
                        type: 'estimate',
                        id: tranID,
                        isDynamic: true,
                    });
                    setFieldValue(currRecord, "custbody_aqt_source", invoiceID);

                    currRecord.save();

                    window.location = redirectURL

                    log.debug("invoiceID", invoiceID)

                }).catch((error)=>{
                    log.error('error while in promise',error)
                })

                dialog.alert({
                    title: "Моля изчакайте",
                    message: "<b>Моля изчакайте, Invoice-a се създава!</b>"
                })



                function setFieldValue(record, id, value) {
                    record.setValue({
                        fieldId: id,
                        value: value,
                        ignoreFieldChange: false
                    });

                }

                function setSublistValue(record, sublist, item, rate) {
                    record.setCurrentSublistValue({
                        sublistId: sublist,
                        fieldId: "location",
                        value: "118",
                        ignoreFieldChange: false
                    });

                    record.setCurrentSublistValue({
                        sublistId: sublist,
                        fieldId: "item",
                        value: item,
                        ignoreFieldChange: false
                    });

                    record.setCurrentSublistValue({
                        sublistId: sublist,
                        fieldId: "rate",
                        value: rate,
                        ignoreFieldChange: false
                    });

                    record.commitLine({
                        sublistId: sublist
                    })
                }
            } catch (e) {
                log.error("error on CS",e.message)
            }
        }
        return {
            createContractInvoice
        };

    });
