var Lodmilla_services = {
    "http://lod.sztaki.hu/sztaki": {
        "shortDescription": {
            "en": "Sztaki"
        },
        "description": {
            "en": "LOD at Sztaki (/sztaki)"
        },
        "sparql": {
            "resourceConnectionsLabels": "select distinct * where { { <{URI}> ?prop ?out. FILTER(!isLiteral(?out) || lang(?out)=\"\" || lang(?out)=\"en\") OPTIONAL { ?out rdfs:label ?label. FILTER(lang(?label)=\"en\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } UNION { ?in ?prop  <{URI}> OPTIONAL { ?in rdfs:label ?label. FILTER(lang(?label)=\"en\"||lang(?label)=\"\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } }"
        },
        "endpoint": "http://lod.sztaki.hu/sparql",
        "prefix": {
            "author": "http://lod.sztaki.hu/sztaki/auth",
            "item": "http://lod.sztaki.hu/sztaki/item"
        },
        "graph": "http://lod.sztaki.hu/sztaki",
        "disabled": "false"
    },
    "http://lod.sztaki.hu/nda": {
        "shortDescription": {
            "en": "Sztaki"
        },
        "description": {
            "en": "LOD at Sztaki (/nda)"
        },
        "sparql": {
            "resourceConnectionsLabels": "select distinct * where { { <{URI}> ?prop ?out. FILTER(!isLiteral(?out) || lang(?out)=\"\" || lang(?out)=\"en\") OPTIONAL { ?out rdfs:label ?label. FILTER(lang(?label)=\"en\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } UNION { ?in ?prop  <{URI}> OPTIONAL { ?in rdfs:label ?label. FILTER(lang(?label)=\"en\"||lang(?label)=\"\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } }"
        },
        "endpoint": "http://lod.sztaki.hu/sparql",
        "prefix": {
            "default": "http://lod.sztaki.hu/data"
        },
        "graph": "http://lod.sztaki.hu/nda",
        "disabled": "false"
    },
    "http://www.civilkapocs.hu": {
        "shortDescription": {
            "en": "Civilkapocs"
        },
        "description": {
            "en": "Civilkapocs"
        },
        "sparql": {
            "resourceConnectionsLabels": "select distinct * where { { <{URI}> ?prop ?out. FILTER(!isLiteral(?out) || lang(?out)=\"\" || lang(?out)=\"hu\") OPTIONAL { ?out rdfs:label ?label. FILTER(lang(?label)=\"hu\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"hu\"||lang(?proplabel)=\"\") } } UNION { ?in ?prop  <{URI}> OPTIONAL { ?in rdfs:label ?label. FILTER(lang(?label)=\"hu\"||lang(?label)=\"\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"hu\"||lang(?proplabel)=\"\") } } }"
        },
        "endpoint": "http://civilkapocs.hu:8890/sparql",
        "prefix": {
            "default": "http://www.civilkapocs.hu/rdf"
        },
        "graph": "http://civilkapocs.hu",
        "disabled": "false"
    },
    "http://lod.nik.uni-obuda.hu": {
        "shortDescription": {
            "en": "Uni Obuda"
        },
        "description": {
            "en": "Obuda University"
        },
        "sparql": {
            "resourceConnectionsLabels": "select distinct * where { { <{URI}> ?prop ?out. FILTER(!isLiteral(?out) || lang(?out)=\"\" || lang(?out)=\"en\") OPTIONAL { ?out rdfs:label ?label. FILTER(lang(?label)=\"en\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } UNION { ?in ?prop  <{URI}> OPTIONAL { ?in rdfs:label ?label. FILTER(lang(?label)=\"en\"||lang(?label)=\"\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } }"
        },
        "endpoint": "http://lod.nik.uni-obuda.hu/sparql",
        "prefix": {
            "default": "http://lod.nik.uni-obuda.hu/"
        },
        "graph": "http://lod.nik.uni-obuda.hu/graph",
        "disabled": "false"
    },
    "http://dbpedia.org": {
        "shortDescription": {
            "en": "DBpedia"
        },
        "description": {
            "en": "DBpedia is a community effort to extract structured information from Wikipedia and to make this information available on the Web. DBpedia allows you to ask sophisticated queries against Wikipedia, and to link other data sets on the Web to Wikipedia data."
        },
        "sparql": {
            "resourceConnectionsLabels": "select distinct * where { { <{URI}> ?prop ?out. FILTER(!isLiteral(?out) || lang(?out)=\"\" || lang(?out)=\"en\") OPTIONAL { ?out rdfs:label ?label. FILTER(lang(?label)=\"en\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } UNION { ?in ?prop  <{URI}> OPTIONAL { ?in rdfs:label ?label. FILTER(lang(?label)=\"en\"||lang(?label)=\"\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } }"
        },
        "endpoint": "http://dbpedia.org/sparql",
        "prefix": {
            "default": "http://dbpedia.org/resource"
        },
        "graph": "http://dbpedia.org",
        "disabled": "false"
    },
    "http://wikidata.dbpedia.org": {
        "shortDescription": {
            "en": "DBpedia Wikidata"
        },
        "description": {
            "en": "Wikidata is a free and open knowledge base that can be read and edited by both humans and machines."
        },
        "sparql": {
            "resourceConnectionsLabels": "select distinct * where { { <{URI}> ?prop ?out. FILTER(!isLiteral(?out) || lang(?out)=\"\" || lang(?out)=\"en\") OPTIONAL { ?out rdfs:label ?label. FILTER(lang(?label)=\"en\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } UNION { ?in ?prop  <{URI}> OPTIONAL { ?in rdfs:label ?label. FILTER(lang(?label)=\"en\"||lang(?label)=\"\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } }"
        },
        "endpoint": "http://wikidata.dbpedia.org/sparql",
        "prefix": {
            "default": "http://wikidata.dbpedia.org/resource"
        },
        "graph": "http://wikidata.dbpedia.org",
        "disabled": "false"
    },
    "http://wikidata.org": {
        "shortDescription": {
            "en": "Wikidata"
        },
        "description": {
            "en": "Wikidata is a free and open knowledge base that can be read and edited by both humans and machines."
        },
        "sparql": {
            "resourceConnectionsLabels": "select distinct * where { { <{URI}> ?prop ?out. FILTER(!isLiteral(?out) || lang(?out)=\"\" || lang(?out)=\"en\") OPTIONAL { ?out rdfs:label ?label. FILTER(lang(?label)=\"en\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } UNION { ?in ?prop  <{URI}> OPTIONAL { ?in rdfs:label ?label. FILTER(lang(?label)=\"en\"||lang(?label)=\"\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } }"
        },
        "endpoint": "http://query.wikidata.org/",
        "prefix": {
            "default": "http://www.wikidata.org/entity"
        },
        "graph": "http://wikidata.org",
        "disabled": "false"
    },
    "http://data.szepmuveszeti.hu/": {
        "shortDescription": {
            "en": "Szépművészeti"
        },
        "description": {
            "en": "Szépművészeti"
        },
        "sparql": {
            "resourceConnectionsLabels": "select distinct * where { { <{URI}> ?prop ?out. FILTER(!isLiteral(?out) || lang(?out)=\"\" || lang(?out)=\"en\") OPTIONAL { ?out rdfs:label ?label. FILTER(lang(?label)=\"en\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } UNION { ?in ?prop  <{URI}> OPTIONAL { ?in rdfs:label ?label. FILTER(lang(?label)=\"en\"||lang(?label)=\"\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } }"
        },
        "endpoint": "http://data.szepmuveszeti.hu/sparql",
        "prefix": {
            "default": "http://data.szepmuveszeti.hu/",
            "resource": "http://data.szepmuveszeti.hu/id/resource/"
        },
        "graph": "http://data.szepmuveszeti.hu/",
        "disabled": "false"
    },    
    "http://europeana.ontotext.com/": {
        "shortDescription": {
            "en": "Europeana"
        },
        "description": {
            "en": "Europeana"
        },
        "sparql": {
            "resourceConnectionsLabels": "select distinct * where { { <{URI}> ?prop ?out. FILTER(!isLiteral(?out) || lang(?out)=\"\" || lang(?out)=\"en\") OPTIONAL { ?out rdfs:label ?label. FILTER(lang(?label)=\"en\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } UNION { ?in ?prop  <{URI}> OPTIONAL { ?in rdfs:label ?label. FILTER(lang(?label)=\"en\"||lang(?label)=\"\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } }"
        },
        "endpoint": "http://europeana.ontotext.com/sparql.json",
        "prefix": {
            "default": "http://data.europeana.eu"
        },
        "graph": "http://data.europeana.eu",
        "disabled": "true"
    },
    "http://collection.britishmuseum.org/": {
        "shortDescription": {
            "en": "British Museum"
        },
        "description": {
            "en": "British Museum's collection"
        },
        "sparql": {
            "resourceConnectionsLabels": "select distinct * where { { <{URI}> ?prop ?out. FILTER(!isLiteral(?out) || lang(?out)=\"\" || lang(?out)=\"en\") OPTIONAL { ?out rdfs:label ?label. FILTER(lang(?label)=\"en\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } UNION { ?in ?prop  <{URI}> OPTIONAL { ?in rdfs:label ?label. FILTER(lang(?label)=\"en\"||lang(?label)=\"\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } }"
        },
        "endpoint": "http://collection.britishmuseum.org/sparql.json",
        "prefix": {
            "default": "http://collection.britishmuseum.org"
        },
        "graph": "http://collection.britishmuseum.org/",
        "disabled": "true"
    },
    "http://factforge.net/": {
        "shortDescription": {
            "en": "FactForge"
        },
        "description": {
            "en": "FactForge"
        },
        "sparql": {
            "resourceConnectionsLabels": "select distinct * where { { <{URI}> ?prop ?out. FILTER(!isLiteral(?out) || lang(?out)=\"\" || lang(?out)=\"en\") OPTIONAL { ?out rdfs:label ?label. FILTER(lang(?label)=\"en\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } UNION { ?in ?prop  <{URI}> OPTIONAL { ?in rdfs:label ?label. FILTER(lang(?label)=\"en\"||lang(?label)=\"\") } OPTIONAL { ?prop rdfs:label ?proplabel. FILTER(lang(?proplabel)=\"en\"||lang(?proplabel)=\"\"||lang(?proplabel)=\"en-us\") } } }"
        },
        "endpoint": "http://factforge.net/sparql",
        "prefix": {
            "default": "http://factforge.net/",
            "resource": "http://factforge.net/resource",
            "dbpedia": "http://factforge.net/resource/dbpedia"
        },
        "graph": "http://factforge.net/",
        "disabled": "true"
    }
    
};