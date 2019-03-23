<template>
    <div>
        <router-link
            class="navigator--link"
            v-if="title && link"
            v-bind:to="link"
        >
            {{ title }}
        </router-link>
        <span class="navigator--title" v-if="title && !link">{{ title }}</span>
        <ul class="navigator--children" v-if="children && children.length">
            <li
                class="navigator--item"
                v-for="(child, index) in children"
                :key="index"
            >
                <NavItem
                    v-bind:title="child.title"
                    v-bind:link="child.link"
                    v-bind:children="child.children"
                />
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'NavItem',
    props: ['title', 'link', 'children']
};
</script>

<style>
.navigator--link {
}
.navigator--children {
    padding-left: 1em;
}
.navigator--item {
    list-style-type: none;
}
</style>
