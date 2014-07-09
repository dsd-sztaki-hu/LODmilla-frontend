/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2013 Sandor Turbucz, Zoltan Toth, Andras Micsik - MTA SZTAKI DSD
 *
 */

/*
 * Class:Connection
 */
var Connection = function(target, connectionUri, direction, endpointLabel) {
    this.target = target;
    this.connectionUri = connectionUri;

    this.direction = direction;
    this.endpointLabel = endpointLabel;
    
    this.getConnectionLabelShort = function(){
        var label = this.connectionUri;
        label = Profile.getPropertyLabel(this.connectionUri);
        label = Helper.getCapitalizedString(label);
        return label;
    };
};