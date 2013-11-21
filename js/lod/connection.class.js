/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2013 Sandor Turbucz, Zoltan Toth - MTA SZTAKI DSD
 *
 */

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