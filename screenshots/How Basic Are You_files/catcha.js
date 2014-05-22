var BF_Catcha = function(){
	// These keys should match those in CatchaDAO; the values are the object on which drawCatcha is called
	this.service_handlers = {
		'email_a_friend' : shareEmail,
		'rerankable_posts' : shareEmail
	};
	
	// Store the catcha answer here so the BF Request can find it regardless of what the form looks like
	this.catcha_answer = '';
	
	// Look up the appropriate object to for this service and call it
	this.draw_catcha = function(service) {
		var handler = this.service_handlers[service];
		if ( handler ) {
			if ( typeof handler.draw_catcha != 'undefined' ) handler.draw_catcha.call()
			else console.warn('draw_catcha is not defined on the handling object for service ' + service);
		}
		else {
			console.warn('No handler defined for catcha service ' + service);
		}
	};
	
	// Set the catcha image and appropriate question ... note the question will appear as a cookie when the image comes back.
	this.set_image_and_question = function( data ) {
		try{
		data.image_element.setAttribute('src','/buzzfeed/catcha/' + data.service + '.jpg?cb=' + (new Date()).getTime() + '.' + Math.floor(Math.random() * 10000));
		data.image_element.observe('load', function(){
			data.question_element.update('What is the name of the cat in position ' + readCookie('catcha-'+ data.service +'-question') + '?');
		})
		} catch(e){
			console.dir({ e : e })
		}
	}
}

bf_catcha = new BF_Catcha();
if ( typeof draw_catcha_for_service != 'undefined' ) {
	bf_catcha.draw_catcha( draw_catcha_for_service );
}
