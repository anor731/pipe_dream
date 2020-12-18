'''js asyncChannel.js'''

Two what appears to be consecutive console logs, produce totally different output... I think the at least one random number should be there twice, and there's no such thing...

I know it's also buggy on different places,

I even had version with those 'buffer really streaming' but there still was those annoying console logs don't getting right.

It's part of bigger project, where asyncChannels like this can be attached to each other, and it'll automatically stream on push and on pull, respecting asynchronicity.

It also does out of memory error after a while, and I have no idea why, I even tried to delete tasks manually, everything should be collected by garbage collector but it's not.
