import { Menu, Tray, app, nativeImage, type NativeImage } from 'electron'
import { TRAY_GLYPH_SPROUT, glyphToBitmap } from './trayGlyph'

// GC로 트레이가 사라지지 않도록 모듈 스코프에 보관한다.
let tray: Tray | null = null

/** 글리프 데이터에서 1x(16px) + 2x(32px) 템플릿 이미지를 만든다. PNG 파일을 굽지 않는다. */
export function createTrayImage(): NativeImage {
  const x1 = glyphToBitmap(TRAY_GLYPH_SPROUT, 1)
  const x2 = glyphToBitmap(TRAY_GLYPH_SPROUT, 2)

  const image = nativeImage.createFromBitmap(Buffer.from(x1.data), {
    width: x1.width,
    height: x1.height,
    scaleFactor: 1,
  })
  image.addRepresentation({
    scaleFactor: 2,
    width: x2.width,
    height: x2.height,
    buffer: Buffer.from(x2.data),
  })
  image.setTemplateImage(true)
  return image
}

export function createTray(): Tray {
  if (tray) return tray

  tray = new Tray(createTrayImage())
  // 1단계 범위: 메뉴는 「종료」 한 항목만. 타이틀·카운트·깜빡임·툴팁·상태는 이후 단계.
  tray.setContextMenu(Menu.buildFromTemplate([{ label: '종료', click: () => app.quit() }]))
  return tray
}
