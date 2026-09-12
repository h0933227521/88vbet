export async function onRequest(context) {
    const request = context.request;
    const publicUrl = new URL(request.url);

    const originHost = "riobet-ingk.buzz";
    const originBase = `https://${originHost}`;

    const originUrl = new URL(
        publicUrl.pathname + publicUrl.search,
        originBase
    );

    const headers = new Headers(request.headers);

    headers.set("X-Forwarded-Host", publicUrl.host);
    headers.set("X-Forwarded-Proto", "https");

    const response = await fetch(originUrl.toString(), {
        method: request.method,
        headers,
        body:
            request.method === "GET" || request.method === "HEAD"
                ? undefined
                : request.body,
        redirect: "manual"
    });

    const responseHeaders = new Headers(response.headers);

    // Chặn redirect về domain VPS
    const location = responseHeaders.get("location");

    if (location) {
        const publicBase = `${publicUrl.protocol}//${publicUrl.host}`;

        responseHeaders.set(
            "location",
            location
                .replace(`https://${originHost}`, publicBase)
                .replace(`http://${originHost}`, publicBase)
        );
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
    });
}
