/*
 * Class:Connection
 */
var Connection = function(target, connectionLabel, direction, endpointLabel) {
    this.target = target;
    this.connectionLabel = connectionLabel;    

    this.direction = direction;
    this.endpointLabel = endpointLabel;
    
    this.getConnectionLabelShort = function(){
        var label = this.connectionLabel;
        label = Profile.getPropertyLabel(this.connectionLabel);        
        label = Profile.util_getCapitalizedString(label);
        return label;
    };
};