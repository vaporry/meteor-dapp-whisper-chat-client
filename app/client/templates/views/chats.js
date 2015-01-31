/**
Template Controllers

@module Templates
*/

/**
The chats template

@class [template] views_chats
@constructor
*/

Template['views_chats'].rendered = function(){
    // add autogrow
    // console.log(this.$('textarea[name="write-message"]'));
    // this.$('textarea[name="write-message"]').autogrow({
    //     context: $('main.dapp-content.dapp-has-header'), //what to wire events to
    //     animate: false, //if you want the size change to animate
    //     speed: 200, //speed of animation
    //     fixMinHeight: true, //if you don't want the box to shrink below its initial size
    //     // cloneClass: 'autogrowclone', //helper CSS class for clone if you need to add special rules
    //     // onInitialize: false, //resizes the textareas when the plugin is initialized
    // });
};


Template['views_chats'].helpers({
    /**
    Get the messages for this chat, group them by user e.g.:

        {
            _id: 'as2342',
            from: {
                identity: '0x4234..',
                name: 'my name'
            },
            messages: [{
                _id: '432334',
                topic: 'my topic',
                message: 'Hi!',
                edited: some Date
            },{
                _id: 'as2342',
                topic: null,
                message: 'Whats up?'
            }]
        }

    @method (groupedMessages)
    */
    'groupedMessages': function(){
        if(_.isArray(this.messages)) {
            var messages = Messages.find({_id: {$in: this.messages}}, {sort: {timestamp: -1, privateChat: 1}}).fetch();

            var messageBlocks = [],
                lastTopic = null;
            _.each(messages, function(item) {

                // if identity changes, create a new "block"
                if(!_.last(messageBlocks) ||
                   _.last(messageBlocks).from.identity !== item.from.identity) {

                    item.messages = [_.clone(item)];

                    delete item.message;
                    messageBlocks.push(item);


                // id the identity is the same, just a dd a new message to the messages array
                } else {

                    var messages = messageBlocks[messageBlocks.length-1].messages;
                    var message = _.clone(item);
                    message.topic = (item.topic !== lastTopic) ? item.topic : null;

                    messages.push(message);

                    delete messageBlocks[messageBlocks.length-1].message;
                    messageBlocks[messageBlocks.length-1]._id = item._id; // keep one item id, to prevent rearrangement
                    messageBlocks[messageBlocks.length-1].messages = messages;

                }

                lastTopic = item.topic;
            });

            return messageBlocks;
        }
    },
    /**
    Super duper format message helper.

    Strips HTML

    @method (message)
    */
    'message': function(){
        var text = this.message || '';


        // add prettyprint
        // var template = Template.instance();
        // if(template.view.isRendered) {
            
        //     Tracker.afterFlush(function(){
        //         console.log(template.$('code')[0]);
        //         template.$('code').wrap('<pre class="prettyprint">');
        //         prettyPrint();
        //     });
        // }

        // make sure not existing values are not Spacebars.kw
        // if(stripHtml instanceof Spacebars.kw)
        //     stripHtml = false;

        if(_.isString(text)) {

            text = _.stripTags(text); // stripTags or escapeHTML?

            // parse hashtags and add a target="_blank" to links
            return text
                // .replace(/\n+/g,'<br>')
                // this regex finds every link http://mylink.de, www.mylink.de and even mylink.de
                // Thanks to Android: http://grepcode.com/file/repository.grepcode.com/java/ext/com.google.android/android/2.0_r1/android/text/util/Regex.java#Regex.0WEB_URL_PATTERN
                .replace(/((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi, '<a href="http://$1" target="_blank">$1</a>')
                .replace("\n",'<br>')
                .replace(/http\:\/\/http\:\/\//g,'http://')
                .replace(/http\:\/\/https\:\/\//g, 'https://')
                .replace(/(\#[\w]+)/g, '<a href="http://twitter.com/$1">$1</a>')
                .replace(/^(\@[\w]+)/g, ' <a href="http://twitter.com/$1">$1</a>')
                .replace(/ (\@[\w]+)/g, ' <a href="http://twitter.com/$1">$1</a>')
                .replace(/<a href\=\"http\:\/\/twitter\.com/g,'<a target="_blank" href="http://twitter.com');

        } else if(_.isFinite(text)) {
            return text;
        } else {
            return null;
        }
    },
    /**
    Gets the last stored topic.

    @method (myTopic)
    @return {String}
    */
    'myTopic': function(){
        return amplify.store('whisper-last-topic');
    }
});



Template['views_chats'].events({
    /**
    Sets the clicked topic, as the current topic

    @event click button.topic
    */
    'click button.topic': function(e, template){
        var selectedTopic = $(e.currentTarget).text();
        template.find('input[name="topic"]').value = selectedTopic;

        // focus the textarea
        template.$('textarea[name="write-message"]').focus();

        // trigger blur to send notification and store in localstorage
        template.$('input[name="topic"]').trigger('blur');
    },
    /**
    Edit the current message

    @event click button.edit-message
    */
    'click button.edit-message': function(e, template){
        template.find('input[name="topic"]').value = this.topic;
        template.find('textarea[name="write-message"]').value = this.message;

        TemplateVar.set('editMessage', this._id);

        // focus the textarea
        template.$('textarea[name="write-message"]').focus();
    },
    /**
    Send the changed topic notification

    @event blur input[name="topic"]
    */
    'blur input[name="topic"]': function(e, template){
        if(e.currentTarget.value !== amplify.store('whisper-last-topic')) {
            // SEND the INVITATION NOTIFICATION
            Whisper.addMessage(template.data._id,{
                type: 'notification',
                sending: true,
                message: 'topicChanged',
                chat: template.data._id,
                timestamp: new Date(),
                from: {
                    identity: Whisper.getIdentity().identity,
                    name: Whisper.getIdentity().name
                },
                // the new topic name
                data: e.currentTarget.value
            });

            // store the new topic
            amplify.store('whisper-last-topic', e.currentTarget.value);
        }

    },
    /**
    Prevent ENTER in the text area, if no shift is pressed

    @event keydown textarea[name="write-message"]
    */
    'keydown textarea[name="write-message"]': function(e){
        // Enter was pressed without shift key
        if (e.keyCode == 13 && !e.shiftKey) {
            // prevent default behavior
            e.preventDefault();
        }

        // if empty, cancel the editing of a message and return
        if(_.isEmpty(_.trim(e.currentTarget.value, "\n"))) {
            TemplateVar.set('editMessage', null);
        }

    },
    /**
    Send a message to the chat on ENTER (but only when shift is not pressed).
    Clear the message on ESC and edit the last message on ARROW UP

    @event keyup textarea[name="write-message"]
    */
    'keyup textarea[name="write-message"]': function(e, template){
        // AUTOGROW THE TEXTAREA
        var newlines = e.currentTarget.value.match(/^/mg).length;
        if(newlines > 3)
            $(e.currentTarget).css('height', 100 + ((newlines - 4) * 20));


        var message = _.trim(e.currentTarget.value, "\n "),
            send = false,
            selectedTopic = template.find('input[name="topic"]').value;


        // IF KEYUP is pressed, EDIT the LAST MESSAGE
        if(e.keyCode === 38 && _.isEmpty(message)) {
            // get my last message
            var lastEntry = Messages.findOne({
                _id: {$in: template.data.messages},
                'from.identity': Whisper.getIdentity().identity,
                type: {$ne: 'notification'
            }}, {sort: {timestamp: -1}});

            template.find('input[name="topic"]').value = lastEntry.topic;
            e.currentTarget.value = lastEntry.message;

            TemplateVar.set('editMessage', lastEntry._id);
        }

        // IF ESC, clear the form, and cancel the edit message
        if(e.keyCode === 27) {

            // unset the edited message
            TemplateVar.set('editMessage', null);

            // clear text field
            e.currentTarget.value = '';
            $(e.currentTarget).css('height', '');
        }


        // IF ENTER, send new/edited message
        if(e.keyCode === 13 && !e.shiftKey && !_.isEmpty(message)) {
            e.preventDefault();

            // EDIT current message
            if(TemplateVar.get('editMessage')) {
                send = Messages.update(TemplateVar.get('editMessage'), {$set: {
                        type: 'edit',
                        chat: template.data._id,
                        topic: selectedTopic,
                        message: message,
                        edited: new Date()
                    }
                })

                // unset the edited message
                TemplateVar.set('editMessage', null);


            // INSERT new message
            } else {

                send = Whisper.addMessage(template.data._id, {
                    type: 'message',
                    sending: true, // needed to send them, will be removed after
                    timestamp: new Date(),
                    topic: selectedTopic,
                    // unread: true,
                    from: {
                        identity: Whisper.getIdentity().identity,
                        name: Whisper.getIdentity().name
                    },
                    message: message,
                    privateChat: template.data.privateChat
                });

                if(send) {


                    // ANIMATION
                    Meteor.setTimeout(function(){
                        $(".dapp-content-header").addClass("animate").hide();
                    }, 100);
                    Meteor.setTimeout(function(){
                        $(".dapp-content-header").show();
                    }, 200);                
                    Meteor.setTimeout(function(){
                        $(".dapp-content-header")
                            .removeClass("animate")
                            .find("textarea")
                            .focus();
                    }, 400);
                }



            }


            // clear text field
            if(send) {
                e.currentTarget.value = '';
                $(e.currentTarget).css('height', '');
            }
        }

    }
});