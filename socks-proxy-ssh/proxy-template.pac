function FindProxyForURL(url, host) {
    //
    //Bypass proxy for internal hosts
    //
    // 0.0.0.0/8 Software, current network (only valid as source address).
    // 10.0.0.0/8 Private network, Used for local communications within a private network.
    // 127.0.0.0/8 Host, Used for loopback addresses to the local host.
    // 169.254.0.0/16 Subnet, sed for link-local addresses between two hosts on a single link when no IP address is otherwise specified.
    // 172.16.0.0/12 Private network, Used for local communications within a private network.
    // 192.0.0.0/24 Private network, IETF Protocol Assignments.
    // 192.0.2.0/24 Documentation, Assigned as TEST-NET-1, documentation and examples.
    // 192.168.0.0/16 Private network, Used for local communications within a private network.
    // 198.18.0.0/15 Private network, Used for benchmark testing of inter - network communications between two separate subnets.
    if (isInNet(host, "0.0.0.0", "255.0.0.0") ||
        isInNet(host, "10.0.0.0", "255.0.0.0") ||
        isInNet(host, "127.0.0.0", "255.0.0.0") ||
        isInNet(host, "169.254.0.0", "255.255.0.0") ||
        isInNet(host, "172.16.0.0", "255.240.0.0") ||
        isInNet(host, "192.0.0.0", "255.255.255.0") ||
        isInNet(host, "192.0.2.0", "255.255.255.0") ||
        isInNet(host, "192.168.0.0", "255.255.0.0") ||
        isInNet(host, "192.18.0.0", "255.254.0.0") )
    {
        return "DIRECT";
    }

    return "SOCKS SOCKS_HOSTNAME:SOCKS_PORT";
}