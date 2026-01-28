import newrelic from 'newrelic';

export async function NewRelicScript() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') {
        return null;
    }

    const browserTimingHeader = newrelic.getBrowserTimingHeader({
        hasToRemoveScriptWrapper: true,
    });

    if (!browserTimingHeader) {
        return null;
    }

    return (
        <script
            id="new-relic"
            dangerouslySetInnerHTML={{ __html: browserTimingHeader }}
        />
    );
}
