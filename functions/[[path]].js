export async function onRequest(context) {
    const request = context.request;
    const visitorUrl = new URL(request.url);

    // DOMAIN WORDPRESS TRÊN VPS
    const originHost = "188v.io";

    // Giữ nguyên đường dẫn + query
    const originUrl = new URL(
        visitorUrl.pathname + visitorUrl.search,
        `https://${originHost}`
    );

    // Copy headers từ request
    const headers = new Headers(request.headers);

    // Cho origin biết domain public mà khách đang truy cập
    headers.set("X-Forwarded-Host", visitorUrl.host);
    headers.set("X-Forwarded-Proto", "https");

    const originRequest = new Request(originUrl.toString(), {
        method: request.method,
        headers,
        body:
            request.method === "GET" || request.method === "HEAD"
                ? undefined
                : request.body,
        redirect: "manual"
    });

    const response = await fetch(originRequest);

    const responseHeaders = new Headers(response.headers);

    // Nếu WordPress redirect về domain gốc,
    // đổi Location trở lại pages.dev
    const location = responseHeaders.get("location");

    if (location) {
        responseHeaders.set(
            "location",
            location.replace(
                `https://${originHost}`,
                `${visitorUrl.protocol}//${visitorUrl.host}`
            )
        );
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
    });
}
