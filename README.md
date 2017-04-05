LODmilla-frontend
=================

LODmilla - a graph-based Linked Open Data browser

Demo: http://munkapad.sztaki.hu/lodmilla/
Presentation: http://lcpd2013.research-infrastructures.eu/slides/lodmilla.pdf

Intended as a prototype tool for generic LOD browsing. 
This frontend of LODmilla is written in "plain" jQuery, no js frameworks used (yet).
Graph visualization is done by jsPlumb.

Licensed as free software under the terms of the Apache v2.0 License: http://www.apache.org/licenses/LICENSE-2.0.html

We are searching contributors for writing plug-ins or improve the code.

Please refer/cite the authors when re-using this code:

http://eprints.sztaki.hu/8054/
Micsik, András and Turbucz, Sándor and Tóth, Zoltán (2015) Exploring publication metadata graphs with the LODmilla browser and editor.
International Journal on Digital Libraries, 16 (x1). pp. 15-24. DOI:10.1007/s00799-014-0130-2

http://eprints.sztaki.hu/8012/
Micsik, András and Turbucz, Sándor and Györök, Attila (2014) LODmilla: a Linked Data Browser for All.
In: Posters&Demos@SEMANTiCS 2014, 2014.09.04-2014.09.05, Leipzig, Germany.

How to configure LODmilla for a new SPARQL endpoint?
----------------------------------------------------

LODmilla can use any LOD server with JSONP support, however with SPARQL endpoint configured, you will get better functionality.

1. In js/lod/services.js add description for your SPARQL endpoint. You can copy and edit an existing endpoint which seems similar to yours. At this point, you will be able to open a URI by entering it in the box "Or enter a node URI".
2. If you want autocomplete queries as well, you need to edit js/lod/profile.class.js as well, and your search URL to this.searchURLs. Again, use existing examples. After this, you will see your endpoint in the top dropdown list showing 'dbpedia'.
