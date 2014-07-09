/*
 * LODmilla-frontend
 *
 * https://github.com/dsd-sztaki-hu/LODmilla-frontend
 *
 * Copyright (c) 2013 Sandor Turbucz, Zoltan Toth, Andras Micsik - MTA SZTAKI DSD
 *
 */

var Service = function(name,shortDescription,description,endpoint,prefix,graph,sparqlTemplates,disabled){
        
    this.name = name;
    this.shortDescription = shortDescription;
    this.description = description;
    this.endpoint = endpoint;
    this.prefix = prefix;
    this.graph = graph;
    this.disabled = disabled;

    this.sparqlTemplates = sparqlTemplates;    
        
};


