import json
import os
import shutil
import getpass
from pathlib import Path

def configure_servers():
    config_path = Path(os.path.expanduser("~/.gemini/antigravity/mcp_config.json"))
    
    if not config_path.exists():
        print(f"Error: Configuration file not found at {config_path}")
        return

    # Backup existing config
    backup_path = config_path.with_suffix(".json.bak")
    shutil.copy2(config_path, backup_path)
    print(f"Backed up configuration to {backup_path}")

    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
    except json.JSONDecodeError:
        print("Error: Failed to parse existing configuration file.")
        return

    print("\n--- Snyk Configuration ---")
    snyk_token = getpass.getpass("Enter your Snyk API Token: ").strip()
    
    print("\n--- Supabase Configuration ---")
    supabase_token = getpass.getpass("Enter your Supabase Access Token: ").strip()

    if not snyk_token or not supabase_token:
        print("Error: Both tokens are required.")
        return

    # Update or Add Snyk Server
    config['mcpServers'] = config.get('mcpServers', {})
    
    config['mcpServers']['snyk'] = {
        "command": "npx",
        "args": ["-y", "mcp-snyk"],
        "env": {
            "SNYK_TOKEN": snyk_token
        }
    }

    # Update or Add Supabase Server
    config['mcpServers']['supabase'] = {
        "command": "npx",
        "args": ["-y", "@supabase/mcp-server-supabase@latest"],
        "env": {
            "SUPABASE_ACCESS_TOKEN": supabase_token
        }
    }

    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)

    print("\nSuccess! MCP configuration updated.")
    print("Please restart your agent or reload the window for changes to take effect.")

if __name__ == "__main__":
    configure_servers()
