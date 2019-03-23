<template>
    <div id="app">
        <div class="header"><h1>Title</h1></div>
        <nav class="navigator">
            <NavItem
                v-bind:children="navItems"
                v-bind:title="null"
                v-bind:link="null"
            />
        </nav>
        <div class="main"><router-view /></div>
    </div>
</template>

<script>
import NavItem from './components/NavItem';

export default {
    components: {
        NavItem: NavItem
    },
    data: function() {
        return {
            navItems: [
                {
                    title: 'Home',
                    link: '/',
                    children: []
                },
                {
                    title: 'Administration',
                    children: [
                        {
                            title: 'Users',
                            link: '/Users',
                            children: []
                        },
                        {
                            title: 'Encryption',
                            link: '/SSL',
                            children: []
                        }
                    ]
                },
                {
                    title: 'Look and feel',
                    children: [
                        {
                            title: 'Theme',
                            link: '/Theme',
                            children: []
                        }
                    ]
                }
            ]
        };
    }
};
</script>

<style>
#app {
    display: grid;
    grid-gap: 1em;
    grid-template-areas:
        "header header"
        "navigator main";
    grid-template-columns: auto 1fr;
}
.navigator > div > .navigator--children {
    background-color: #D3DFE3;
    padding: 0.3em;
    border-radius: 0.3em;
}
    .navigator {
        grid-area: navigator;
    }
.main {
    grid-area: main;
}
.header {
    grid-area: header;
    text-align: center;
}
</style>
