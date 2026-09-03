/**
 * HTTP file streaming for the wallpapers routes: single-range GET/HEAD with
 * the `content-range` header the webserver's gzip filter keys on, and a
 * streamed `fs.createReadStream` body so a 30 GB video never buffers whole.
 * @module file-stream
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
interface ByteRange {
    readonly start: number;
    readonly end: number;
}
/**
 * Parse one `range` header into a bounded byte range.
 * @param header - the raw header, or undefined.
 * @param size - total resource size in bytes.
 * @returns the clamped range, `undefined` when absent (full body), and
 * `null` when the request is malformed or unsatisfiable (416).
 */
export declare function parseByteRange(header: string | undefined, size: number): ByteRange | undefined | null;
/**
 * Serve one file from disk with single-range support, owning the whole
 * response lifecycle. Errors before headers answer 404/416; a mid-stream
 * failure destroys the socket, because headers are already sent.
 * @param req - the request whose `range` header and method steer the reply.
 * @param res - the response to write.
 * @param filePath - absolute path of the file to serve.
 * @param contentType - MIME type written on the reply.
 */
export declare function serveFileWithRanges(req: IncomingMessage, res: ServerResponse, filePath: string, contentType: string): void;
export {};
