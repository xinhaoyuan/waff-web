#!/usr/bin/perl -w

use File::Basename;
use Cwd 'abs_path';
use File::Temp;
use File::Path qw(make_path remove_tree);

if (length($ENV{'QUERY_STRING'}) > 0){
    $buffer = $ENV{'QUERY_STRING'};
    @pairs = split(/&/, $buffer);
    foreach $pair (@pairs){
        ($name, $value) = split(/=/, $pair);
        $value =~ s/%([a-fA-F0-9][a-fA-F0-9])/pack("C", hex($1))/eg;
        $in{$name} = $value; 
    }
}

our @output;
our $mod       = basename($in{"mod"});
our $waffbin   = abs_path("waff");
our $gamedir   = abs_path("../data/" . $mod);
our $action    = "play";
our $player    = $in{"player"};
our $contentdir= abs_path("../content/". $mod);

make_path($contentdir);
chdir $gamedir;

our $err = 0;
our $ret=system("lockfile -r 0 $player.ch.lock");
if ($ret != 0)
{
    $ret=system("lockfile -l 5 -s 0 -r 0 $player.ch.lock");
    if ($ret == 0)
    {
        `touch $player.ch.force-locked`;
    }
    else
    {
        push(@output, "error");
        push(@output, "cannot lock the player file");
        $err=1;
    }
}

if ($err == 0)
{
    if ($action eq "play" )
    {
        if (!(-e "$player.ch")) { system("cp ch.template $player.ch"); }
        @output = readpipe("$waffbin $player.ch");
        chomp(@output);
    }
    elsif ($action eq "clean")
    {
        system("rm $player.ch");
        push(@output, "info");
        push(@output, "clean");
    }
}
    
# Parse the output array

our $i = 0;

print("Content-type: text/xml\n\n");
print("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
print("<output>");

print @output;
our $gfx_id = 0;

while ($i <= $#output)
{
    my $head = $output[$i];
    ++ $i;
    
    if ($head eq "bg-gfx")
    {
        if ($i <= $#output)
        {
            my $gfxopt = $output[$i];
            my $gfxcmd = "convert " . $gfxopt . " $contentdir/$player.bg." . $gfx_id . ".jpg";
            ++ $i;
            system($gfxcmd);

            print("<ctl type=\"bg-gfx\">" . $gfx_id . "</ctl>");
            ++ $gfx_id;
        }
    }
    elsif ($head eq "text")
    {
        if ($i <= $#output)
        {
            my $line = $output[$i];
            ++ $i;
            print("<ctl type=\"text\"><![CDATA[" . $line . "]]></ctl>");
        }
    }
    elsif ($head eq "pause")
    {
        print("<ctl type=\"pause\"><![CDATA[" . $line . "]]></ctl>");
    }

}
print("</output>");

if ($err == 0) { system("rm -f $player.ch.lock"); }

