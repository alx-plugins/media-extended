# Media Extended

Improve media (video/audio) playing in Obsidian.

## Intro

This plugin introduce some new features that improve media (video/audio) playing:

- [Embed video/audio fragments](#embed-media-fragments), instead of the whole file.
  - Support internal link for local files, as well as YouTube and Vimeo videos ([Extended image embed syntax](#extended-image-embed-syntax) required)
- [Allow timestamps for video/audio](#timestamps-for-media) in internal links (disabled by default)
- [Extended image embed syntax](#extended-image-embed-syntax) that allows video/audio embeds (disabled by default)
  - From external media files: `![](http://example.com/video.ogv#t=60)`
  - From video hosts: `![](https://www.youtube.com/watch?v=jNQXAC9IVRw)`
    - Timestamps is supported for YouTube and Vimeo videos: `![](https://vimeo.com/336812611#t=10,20)`
- [autoplay/mute/loop for media](#inline-options)
- [External subtitle support for videos](#local-subtitle)
- [ ] [Create links for timestamps from player](https://github.com/alx-plugins/media-extended/issues/9)
- [ ] [Improved pictrue-in-pictrue support](https://github.com/alx-plugins/media-extended/issues/8)

## How to use

### Embed Media Fragments

Just append [Media Fragment URI](#media-fragment-uri) to the embeded internal link and see the results:

![EmbedMediaFragmentsDemo](https://img.aidenlx.top/picgo/EmbedMediaFragmentsDemo.gif)

### Timestamps for Media

Just append [Media Fragment URI](#media-fragment-uri) to the regular internal link and see the results:

![TimestampsForMediaDemo](https://img.aidenlx.top/picgo/TimestampsForMediaDemo.gif)

### Extended Image Embed Syntax

Allow to write `![](http://example.com/video.ogv#t=60)` to embed audio/video files

Now also support videos from different hosts

- Youtube: `![](https://www.youtube.com/watch?v=jNQXAC9IVRw)`
- Bilibili: `![](https://www.bilibili.com/video/BV17x411w7KC)` (Timestamps not supported)
- Vimeo: `![](https://vimeo.com/336812611)`

### Inline Options

| suffix  |  option  |
| :-----: | :------: |
| `#play` | autoplay |
| `#loop` |   loop   |
| `#mute` |  muted   |

Example:

- `![[example.mp4#t=1,2&loop&mute]]`
- `![](https://www.youtube.com/watch?v=jNQXAC9IVRw#loop&t=1,2&mute)`

### Local Subtitle

Now support `.srt` and WebVTT format

Requirements:

- Placed in the same folder as media file
- Using the same file name as media file

> Media File: `example.mp4`
> Subtitle File: `example.vtt` or `example.srt`

- for single language: filename should be identical with media filename
  - `example.vtt` is allowed, not `example.en.vtt`
- for muiltple languages: vaild language code suffix are required
  - For Chinese: `example.zh.vtt`, `example.cn.vtt` is invalid
  - For English: `example.en.vtt`
  - For other language, visit [this list](https://lingohub.com/academy/best-practices/iso-639-1-list)

## Compatibility

The required API feature is only available for Obsidian v0.10.2+.

## Installation

### From Obsidian

1. Open `Settings` > `Third-party plugin`
2. Make sure Safe mode is **off**
3. Click `Browse community plugins`
4. Search for this plugin
5. Click `Install`
6. Once installed, close the community plugins window and the patch is ready to use.

### From GitHub

1. Download the Latest Release from the Releases section of the GitHub Repository
2. Put files to your vault's plugins folder: `<vault>/.obsidian/plugins/media-extended`
3. Reload Obsidian
4. If prompted about Safe Mode, you can disable safe mode and enable the plugin.
   Otherwise, head to Settings, third-party plugins, make sure safe mode is off and
   enable the plugin from there.

> Note: The `.obsidian` folder may be hidden. On macOS, you should be able to press `Command+Shift+Dot` to show the folder in Finder.

## Media Fragment URI

When specifying the URI of media for an `<audio>` or `<video>` element, you can optionally include additional information to specify the portion of the media to play. To do this, append a hash mark `#` followed by the media fragment description.

A time range is specified using the syntax:

    #t=[starttime][,endtime]

The time can be specified as:

- a number of seconds (as a floating-point value), such as `121.12`
- as an hours/minutes/seconds or minutes/seconds time separated with colons, such as `02:01.12`
  - Minutes and seconds should be within 0-59 and written in two digits, for example, `1:20` or `10:3` is invaild.

when the `starttime` is absent, it is set to the beginning of the video/audio, while `endtime` is set to the end by default if absent.

A few examples:

    http://example.com/video.ogv#t=10,20      // Specifies that the video should play the range 10 seconds through 20 seconds.
    http://example.com/video.ogv#t=,10.5      // Specifies that the video should play from the beginning through 10.5 seconds.
    http://example.com/video.ogv#t=,02:00:00  // Specifies that the video should play from the beginning through two hours.
    http://example.com/video.ogv#t=60         // Specifies that the video should start playing at 60 seconds and play through the end of the video.

For more details, See <https://www.w3.org/TR/media-frags/#naming-time>
