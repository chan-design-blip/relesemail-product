# Release Email Generator — Deploy bundle

Plain static HTML/CSS/JS. No build step, no Node runtime, no backend required.

## Hosting on an OrangeHRM server

Copy the contents of this folder into any directory served by your web server.

**Apache** — drop into the docroot (or a subfolder) and it works as-is.
```apache
Alias /release-email /var/www/release-email
<Directory /var/www/release-email>
    Require all granted
    Options -Indexes
    DirectoryIndex index.html
</Directory>
```

**Nginx**
```nginx
location /release-email/ {
    alias /var/www/release-email/;
    index index.html;
}
```

### Requirements
- **HTTPS is mandatory.** Clipboard APIs (Copy HTML, Send test, paste-into-dropzone)
  are blocked by browsers on plain `http://`. `localhost` is exempt for local testing.
- Outbound access to `fonts.googleapis.com` / `fonts.gstatic.com` for the Nunito UI font.
  If the server is air-gapped, self-host the font and change the `<link>` in `index.html`.
- No PHP, Node, or database. Static file serving only.

### Access control
The tool has no auth of its own. If it should be internal-only, put it behind your
existing SSO/reverse-proxy rule or a basic-auth location block.

## Files
```
index.html       UI shell
generator.css    UI styles (email styles are inlined by template.js)
generator.js     form state, image upload/optimisation, preview, copy/download/send-test
template.js      emits the final email HTML
icons.js         icon library + picker modal
assets/          default OrangeHRM logo
```

## Note on AI image generation
Now that this runs on an OrangeHRM host, a server-side Gemini proxy is the clean
path for generating hero images in-app: the API key lives in server config, the
browser only posts a prompt. Ask before building — it adds a server-side
component to what is currently a pure static deploy.


## Image hosting (required for Gmail)

`api/upload-image.php` saves every image in the email to `media/` and the email links to it.
This stops Gmail pasting the layout twice, keeps images visible for recipients, and keeps the email under 102 KB.

- PHP must be able to write to `media/` (create it with `chmod 755`, owned by the web server user).
- The server must be reachable from the public internet. Gmail loads images through Google's proxy, so images on an internal-only host will not show for recipients.
- If the upload fails, the generator falls back to embedding images and warns on copy.
