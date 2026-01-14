// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
use ffmpeg_next as ffmpeg;
use ffmpeg_next::format::input;

#[tauri::command]
fn test(name: &str) -> String {
    if let Err(e) = ffmpeg::init() {
        return format!("FFmpeg初始化失败: {}", e);
    }
    match input(&name) {
        Ok(ctx) => {
            format!(
                "成功打开文件: {};格式: {};时长: {}秒.",
                name,
                ctx.format().name(),
                ctx.duration() as f64 / 1_000_000.0
            )
        }
        Err(e) => {
            format!("打开文件失败: {}: {}", name, e)
        }
    }
}
#[tauri::command]
fn post_sdpoffer(id: &str, url: &str, sdp: &str) -> String {
    format!("postSDPOffer:{}:{}:{}", id, url, sdp)
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, test, post_sdpoffer])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
