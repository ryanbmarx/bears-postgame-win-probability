"""
Opens a preview of a tarbell project in p2p without needing to open the asset page first. 
The link is shareable, but the user must log in to the preview system, for which the creds
are, at the moment, nguxbeta/nguxtr!b 
"""

from tarbell.contextmanagers import ensure_settings, ensure_project
import webbrowser

# https://github.com/newsapps/tarbell-cookbook/blob/master/get_tarbell_site_outside_of_tarbell.py


class MockCommand(object):
    """Mock class that mimics the necessary API of the Tarbell CLI commands"""
    name = "mock"

if __name__ == "__main__":
    mock_command = MockCommand()
    args = []
    with ensure_settings(mock_command, args) as settings, ensure_project(mock_command, args) as site:
        # Do stuff with settings, site

		p2p_slug = site.get_context()['p2p_slug']
		preview_url = "http://chicagotribune-preview.trbprodcloud.com/{0}-htmlstory.html".format(p2p_slug)
		print preview_url
		webbrowser.open_new_tab(preview_url)
		pass


