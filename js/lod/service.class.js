/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2013 Sandor Turbucz, Zoltan Toth - MTA SZTAKI DSD
 *
 */
 
var Service = function(name,shortDescription,description,endpoint,prefix,graph,sparqlTemplates){
        
    this.name = name;
    this.shortDescription = shortDescription;
    this.description = description;
    this.endpoint = endpoint;
    this.prefix = prefix;
    this.graph = graph;
    
    this.sparqlTemplates = sparqlTemplates;    
        
};


