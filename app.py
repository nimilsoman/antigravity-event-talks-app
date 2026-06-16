from flask import Flask, jsonify, render_template, request
import requests
import xml.etree.ElementTree as ET
import re
from datetime import datetime

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def clean_html_content(html_content):
    """
    Remove or clean up any unwanted artifacts in the HTML snippet.
    """
    # Replace relative links with absolute Google Cloud links
    html_content = re.sub(
        r'href="/', 
        'href="https://docs.cloud.google.com/', 
        html_content
    )
    html_content = re.sub(
        r'href="https://cloud.google.com', 
        'href="https://cloud.google.com', 
        html_content
    )
    return html_content

def strip_tags(html_content):
    """
    Strips HTML tags to generate a clean text snippet.
    """
    # Replace tags with space or empty string
    text = re.sub(r'<[^>]+>', ' ', html_content)
    # Normalize whitespaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def parse_release_notes():
    try:
        response = requests.get(FEED_URL, timeout=15)
        response.raise_for_status()
        
        # Parse XML
        root = ET.fromstring(response.content)
        namespaces = {'atom': 'http://www.w3.org/2005/Atom'}
        
        parsed_entries = []
        
        for entry_elem in root.findall('atom:entry', namespaces):
            title = entry_elem.find('atom:title', namespaces).text.strip()
            updated_raw = entry_elem.find('atom:updated', namespaces).text.strip()
            
            link_elem = entry_elem.find('atom:link', namespaces)
            link = link_elem.get('href') if link_elem is not None else ""
            
            content_elem = entry_elem.find('atom:content', namespaces)
            content_html = content_elem.text if content_elem is not None else ""
            
            # Split HTML content by <h3> to extract individual updates
            parts = re.split(r'<h3>', content_html)
            
            for part in parts:
                if not part.strip():
                    continue
                
                # Split by </h3> to separate Type from Description
                subparts = part.split('</h3>', 1)
                if len(subparts) == 2:
                    note_type = subparts[0].strip()
                    note_html = clean_html_content(subparts[1].strip())
                else:
                    note_type = "Update"
                    note_html = clean_html_content(part.strip())
                
                # Generate a clean text snippet for Tweeting
                text_snippet = strip_tags(note_html)
                
                parsed_entries.append({
                    'date': title, # E.g. "June 15, 2026"
                    'updated_raw': updated_raw,
                    'link': link,
                    'type': note_type, # E.g. "Feature", "Issue", "Change", "Breaking", "Announcement"
                    'html': note_html,
                    'text_snippet': text_snippet
                })
                
        return parsed_entries, None
    except Exception as e:
        return [], str(e)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/release-notes')
def get_release_notes():
    entries, error = parse_release_notes()
    if error:
        return jsonify({'success': False, 'error': error}), 500
    return jsonify({'success': True, 'data': entries})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
