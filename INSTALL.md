# Installation

## Download and Install
Download the project files and copy them the your webserver. 
And navigate to the location in your webbrowser.

## Configuration

All important preferences can be accessed from the UI.
So open up your browser and select the settings tab.

Review the directory locations in the first section. By default any data will be stored in the data directory. 
You should stick with the default. In case you need to adjust these directories, 
modifing the paths.json which is located in the setting folder beneath the application root directory.
The directories should be relative to the applications root.

The second section is used to specify the mail. It control the template as well as the sender information.

We'll skip the template for now. Just stick with the default value. We'll look later in more detail who to customize templates. 

Give your newsletter a prefix. The prefix is typially encloses in brackets. This is a common habbit and makes filtering mails easier. But in case you do not want to have a prefix, just clear the field.

As next step set the "from" and "reply to" address as well as a human readable alias.

Then configure the mailserver. You have a choice between using sendmail and smtp.
If you are running in an hosted enviroment, you will be most likely forced to use sendmail.
SMTP is in general more complex and overhead but faster and more secure than sendmail.

Whatever you descide to use, keep in mind the from and reply to address have to match always the domain's mail exchange server.
If not your mails will be most likely rated as spam.

The next settings are about about roles. We'll look into that in the next section.

After the mailserver is configured your are ready to send your first newsletter.
Just create a new address book and then go to drafts and compose your news.


## Access control and Permission

The Access control is disabled by default. Which means every one can edit the address books and settings.

Thus I strongly suggest to activate access control. All you need to do is configuring basic authentication for the root directory. 
An instruction for apache is located here:  https://wiki.apache.org/httpd/PasswordBasicAuth

Prior to activating the basic authentication, open the settings tab and go to roles. 
Ensure that there is at least one user which can access the settings. Otherwise you'll be lockout.
In case this appens go to settings/roles.js and add the username manually.


## Customize templates

When sending messages they are wraped into a customizable template to give all mails a common look and feel. 

The template is a normal html template file which contains a ${content} placeholder tag. 
This tag will replaced with your message when sending mails. 

You can edit can customize the template as you want. But keep in mind web html and mail html are somehow different.
Most mailer readers can render html, but only few support modern features introduces in html5. So be minimalistic and konservative. You can find at mailchimps a good summary about the [basics of html email](https://templates.mailchimp.com/getting-started/html-email-basics/) as well as a more detailed view on [design limitations of html email](http://kb.mailchimp.com/campaigns/design/limitations-of-html-email#Email-HTML-v.-Web-HTML) 

As a special bonus, images which are located in the template directory are automatically embedded into the mail. All other image src links remain untouched.

