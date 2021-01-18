// Example event listener.
// Event argument will always be {eventType, args} dict

// EventHandler.registerCallback(IBOM_EVENT_TYPES.ALL, (e) => console.log(e));


var customRuleIndexes = [];

function hideColumn(column) {
    customRuleIndexes.push(document.styleSheets[0].insertRule(
        `td:nth-child(${column}),th:nth-child(${column}) { display: none }`,
        document.styleSheets[0].cssRules.length
    ));
}

EventHandler.registerCallback(IBOM_EVENT_TYPES.BOM_BODY_CHANGE_EVENT, (event) => {
    while (customRuleIndexes.length > 0) {
        document.styleSheets[0].deleteRule(customRuleIndexes.pop());
    }
    var numCheckboxes = event.args.checkboxes.length;
    hideColumn(numCheckboxes + 3); // Value
    hideColumn(numCheckboxes + 4); // Footprint
});