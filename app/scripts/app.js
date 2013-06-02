require([
        "dojo/ready", 
        "dojo/on",
        "dojo/_base/connect", 
        "dojo/dom",
        "dijit/registry",
        "dojo/dom-construct",
        "dojo/parser", 
        "dijit/layout/BorderContainer", 
        "dijit/layout/ContentPane", 
        "esri/map",
        "esri/arcgis/utils",
        "esri/domUtils",
        "esri/dijit/Popup"
], function(
    ready, 
    on, 
    connect,
    dom,
    registry,
    domConstruct,
    parser, 
    BorderContainer, 
    ContentPane,
    Map,
    arcgisUtils,
    domUtils,
    Popup
) {
    ready(function(){

        parser.parse();

        //create the popup so we can specify that the popupWindow option is false. Additional options
        //can be defined for the popup like modifying the highlight symbol, margin etc. 
        var popup = Popup({
            popupWindow: false
        },domConstruct.create("div"));

        //Create a map based on an ArcGIS Online web map id 
        arcgisUtils.createMap("5f89b26a5ea2491b92a1d1010e637a9a", "map",{
            infoWindow: popup
        }).then(function(response){
            setTimeout(function(){
                $('#loading .content').html($('#formTemplate').html());
                $('#loading .loginBtn').click(function(){
                    var username = $('#inputUsername').val();
                    $.get('/login.json?username=' + username, function(userDetails){
                        var pusher = new Pusher("0e3e169e0f09da634329");
                        var channel = pusher.subscribe(String(userDetails.id));
                        channel.bind('badge', function(response){
                            console.log(response);
                            $('#left').hide('slide', {direction: 'left'}).fadeOut();
                            $('#notification').removeClass('hidden');
                            $('#notification').show();
                            $('#notification .message').html(response.message);
                            $('#notification .contentBack').effect('bounce');
                            $('#fanfare').get(0).play();
                        });
                        $('#loading').fadeOut().addClass('hidden');
                        window.userID = userDetails.id;
                    });
                });
                setTimeout(function(){
                    $('#introLoop').removeAttr('loop');
                }, 5000);
            }, 3000);
            window.map = response.map;
            initializeSidebar(window.map);
        }, function(error){
            console.log("Map creation failed: ", dojo.toJson(error));
        });

        function initializeSidebar(map){
            var popup = map.infoWindow;

            //when the selection changes update the side panel to display the popup info for the 
            //currently selected feature. 
            connect.connect(popup, "onSelectionChange", function(){
                displayPopupContent(popup.getSelectedFeature());
            });

            //when the selection is cleared remove the popup content from the side panel. 
            connect.connect(popup, "onClearFeatures", function(){
                //registry.byId replaces dijit.byId
                registry.byId("leftPane").set("content", "");
                $('#left').hide('slide', {direction: 'left'}).fadeOut();
                $('#map_zoom_slider').removeClass('shifted');
            });

            //When features are associated with the  map's info window update the sidebar with the new content. 
            connect.connect(popup, "onSetFeatures", function(){
                displayPopupContent(popup.getSelectedFeature());
            });
        }

        function displayPopupContent(feature){
            if(feature){
                var content = feature.getContent();
                registry.byId("leftPane").set("content", content);
                $('#left').show('slide', {direction: 'left'}).fadeIn();
                $('#map_zoom_slider').addClass('shifted');
                $('#createProjBtn').hide();
                $('#projectBar').hide();
                $('#project-info').hide();

                var fid = $('#leftPane .esriViewPopup .attrValue')[0].innerHTML;
                $.get('/project/' + fid + '.json', function(project){
                    if (!project){
                        $('#createProjBtn').show();
                        return;
                    }

                    $('#project-info').show();
                    $('#projectBar').show();

                    var percentage = Math.floor((project['amount_funded']/project.price)*100);
                    $('#projectBar .bar').css('width', percentage + '%');
                    $('#project-info .name').html(project.name);
                    $('#project-info .username').html(project.username);
                    if (percentage < 100){
                        $('#projectBar .progress').addClass('active');
                        $('#projectBar .progress').removeClass('progress-success');
                        $('#projectBar .progress').addClass('progress-warning');
                    } else{
                        $('#projectBar .progress').removeClass('active');
                        $('#projectBar .progress').addClass('progress-success');
                        $('#projectBar .progress').removeClass('progress-warning');
                    }  
                });
            }
        }
    });
});
