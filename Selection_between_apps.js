/*
 * Bootstrap-based responsive mashup
 * @owner Enter you name here (xxx)
 */
/*
 *    Fill in host and port for Qlik engine
 */
var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/extensions" ) + 1 );

var config = {
	host: window.location.hostname,
	prefix: prefix,
	port: window.location.port,
	isSecure: window.location.protocol === "https:"
};
//to avoid errors in dev-hub: you can remove this when you have added an app
var app;
require.config( {
	baseUrl: (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix + "resources"
} );

require( ["js/qlik"], function ( qlik ) {

	var control = false;
	qlik.setOnError( function ( error ) {
		$( '#popupText' ).append( error.message + "<br>" );
		if ( !control ) {
			control = true;
			$( '#popup' ).delay( 1000 ).fadeIn( 1000 ).delay( 11000 ).fadeOut( 1000 );
		}
	} );
	$( "body" ).css( "overflow: hidden;" );
	function AppUi ( app ) {
		var me = this;
		this.app = app;
		app.global.isPersonalMode( function ( reply ) {
			me.isPersonalMode = reply.qReturn;
		} );
		app.getAppLayout( function ( layout ) {
			$( "#title" ).html( layout.qTitle );
			$( "#title" ).attr( "title", "Last reload:" + layout.qLastReloadTime.replace( /T/, ' ' ).replace( /Z/, ' ' ) );
			//TODO: bootstrap tooltip ??
		} );
		app.getList( 'SelectionObject', function ( reply ) {
			$( "[data-qcmd='back']" ).parent().toggleClass( 'disabled', reply.qSelectionObject.qBackCount < 1 );
			$( "[data-qcmd='forward']" ).parent().toggleClass( 'disabled', reply.qSelectionObject.qForwardCount < 1 );
		} );
		app.getList( "BookmarkList", function ( reply ) {
			var str = "";
			reply.qBookmarkList.qItems.forEach( function ( value ) {
				if ( value.qData.title ) {
					str += '<li><a data-id="' + value.qInfo.qId + '">' + value.qData.title + '</a></li>';
				}
			} );
			str += '<li><a data-cmd="create">Create</a></li>';
			$( '#qbmlist' ).html( str ).find( 'a' ).on( 'click', function () {
				var id = $( this ).data( 'id' );
				if ( id ) {
					app.bookmark.apply( id );
				} else {
					var cmd = $( this ).data( 'cmd' );
					if ( cmd === "create" ) {
						$( '#createBmModal' ).modal();
					}
				}
			} );
		} );
		$( "[data-qcmd]" ).on( 'click', function () {
			var $element = $( this );
			switch ( $element.data( 'qcmd' ) ) {
				//app level commands
				case 'clearAll':
					app.clearAll();
					break;
				case 'back':
					app.back();
					break;
				case 'forward':
					app.forward();
					break;
				case 'lockAll':
					app.lockAll();
					break;
				case 'unlockAll':
					app.unlockAll();
					break;
				case 'createBm':
					var title = $( "#bmtitle" ).val(), desc = $( "#bmdesc" ).val();
					app.bookmark.create( title, desc );
					$( '#createBmModal' ).modal( 'hide' );
					break;
			}
		} );
	}

	//callbacks -- inserted here --
	//open apps -- inserted here --
	var app = qlik.openApp('Helpdesk Management.qvf', config);
	var app2 = qlik.openApp('Helpdesk Management App2.qvf', config);


	//get objects -- inserted here --
	app.getObject('QV01','xfvKMP');
	
	app2.getObject('QV02','hRZaKk');
	
	app2.getObject('QV03','ycppXj');
	
	
	app.getObject('filter','ycppXj');
	//create cubes and lists -- inserted here --
	if ( app ) {
		new AppUi( app );
	}
	
	var app1SelectionviaAPI=false;
	var app2SelectionviaAPI=false;
	 var selState = app.selectionState( );
	 var listener = function() {
	 	
	 	app2.clearAll();
    	var selFields = selState.selections;
		var cacheString="";
		
		if (selFields!=null){
		$.each(selFields, function(key, value) {
			var valArray=[];
			$.each(value.selectedValues, function(key,value){
				valArray.push(value.qName);
			})
			cacheString=cacheString + '@' + value.fieldName +"~" + value.qSelected;
			app2.field(value.fieldName).selectValues(valArray);
			
		
		});
		localStorage.setItem("QlikFilter",cacheString);
		}
		
  	};
  	selState.OnData.bind( listener );
	retrieveSelectionfromCache();
	
	function retrieveSelectionfromCache()
	{
		var cacheString= localStorage.getItem("QlikFilter");		
		if (cacheString!=null && cacheString !=""){
		app.clearAll();
		var selFields=cacheString.split("@");	
				
		$.each(selFields, function(key, value) {
			if (value!=null && value!=""){
			var valArray=[];
			var s = value.split("~");
			var fieldName=s[0];
			valArray = s[1].split(", ");				
			app.field(fieldName).selectValues(valArray);
			}
		});
		}
		else{
			app.clearAll();
		}
	
	}
 
 
	

} );

